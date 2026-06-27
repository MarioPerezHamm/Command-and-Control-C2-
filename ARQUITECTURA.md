# Documentación Técnica — Command and Control (C2)

> Hackathon TIC Talento Tech | Reto: ALIGO Defensores Informáticos

---

## 1. Visión general

Este documento describe la arquitectura, el protocolo de comunicación y las decisiones de diseño del sistema C2 desarrollado para el hackathon. El sistema permite a un operador controlar múltiples agentes remotos desde una interfaz gráfica centralizada, con comunicación cifrada y soporte para operaciones simultáneas.

---

## 2. Arquitectura del sistema

El sistema está compuesto por tres componentes independientes:

```
┌──────────────────────────────────────────────────────────────┐
│  CAPA DE PRESENTACIÓN                                        │
│  React + Vite + Tailwind CSS  →  localhost:5173             │
│  Generada con v0.dev (Pro)                                   │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTP/REST (CORS habilitado)
                           │ Puerto 8000
┌──────────────────────────▼───────────────────────────────────┐
│  CAPA DE CONTROL — SERVIDOR C2                               │
│  Python 3.11 │ FastAPI │ Uvicorn │ Docker                   │
│                                                              │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │  API REST (8000)    │  │  Socket Server TLS (4444)    │  │
│  │  FastAPI + Uvicorn  │  │  ssl + socket + threading    │  │
│  └─────────────────────┘  └──────────────────────────────┘  │
│                                                              │
│  Estado en memoria:                                          │
│  agentes = {}   historial = {}   counter   lock             │
└──────────────────────────┬───────────────────────────────────┘
                           │ TCP + TLS (autofirmado)
                           │ Puerto 4444
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
  ┌───────────┐     ┌───────────┐     ┌───────────┐
  │  Agent-1  │     │  Agent-2  │     │  Agent-N  │
  │  Linux    │     │  Linux    │     │  Windows  │
  │  stdlib   │     │  stdlib   │     │  stdlib   │
  └───────────┘     └───────────┘     └───────────┘
```

### 2.1 Componentes

| Componente | Tecnología | Responsabilidad |
|------------|------------|-----------------|
| Interfaz React | React + Vite + Tailwind | Panel de control visual del operador |
| Servidor C2 | FastAPI + Python | Orquestación, estado, API REST |
| Socket Server | socket + ssl + threading | Canal cifrado con los agentes |
| Agente | Python stdlib | Ejecución de comandos en el endpoint |

---

## 3. Protocolo de comunicación

### 3.1 Canal Agente ↔ Servidor (TCP + TLS, puerto 4444)

El canal de agentes usa TCP persistente con cifrado TLS. No es REST — es comunicación binaria directa sobre socket.

**Flujo de conexión:**
```
Agente                          Servidor
  │                                │
  │── TCP connect → 4444 ─────────►│
  │◄──── TLS handshake ───────────►│
  │── send(platform.system()) ────►│  "Windows" / "Linux"
  │                                │  Registra: {id, conn, addr, os, connected_at}
  │         [en espera de comandos]│
  │◄── send(comando) ─────────────│
  │── subprocess.check_output() ──│
  │── send(resultado) ────────────►│
  │                                │
```

**Protocolo de mensajes:**
- Codificación: UTF-8
- Sin delimitadores de frame — cada `send()` corresponde a un mensaje lógico
- Timeout de ejecución: 10 segundos por comando (`subprocess timeout=10`)

### 3.2 Canal Operador ↔ Servidor (HTTP REST, puerto 8000)

La interfaz React se comunica con el servidor exclusivamente via HTTP REST. CORS habilitado con `allow_origins=["*"]` para el entorno de laboratorio.

**Endpoints:**

```
GET  /                    → {"status": "C2 Server running"}
GET  /agentes             → lista de agentes conectados con metadata
POST /ejecutar            → {agente_id, comando} → {resultado}
POST /broadcast           → {comando} → {agente_id: resultado, ...}
GET  /historial/{id}      → [{cmd, result, timestamp}, ...]
```

---

## 4. Decisiones de diseño

### 4.1 Separación de canales

Se decidió usar **dos canales independientes** en lugar de un único canal REST:

- El canal de agentes (TCP+TLS) es una conexión persistente, lo que permite detectar desconexiones en tiempo real y mantener estado de sesión sin polling.
- El canal del operador (REST) es stateless por diseño, lo que simplifica la interfaz y permite escalar horizontalmente.

### 4.2 Arquitectura de hilos

```python
# Hilo principal: FastAPI + Uvicorn (puerto 8000)
# Hilo separado: socket_server TCP (puerto 4444)
# Un hilo por agente conectado: handle_agent()
```

Cada agente tiene su propio hilo. El hilo usa `time.sleep(1)` en el loop de espera para mantenerlo vivo sin consumir CPU ni interferir con el socket que usa `/ejecutar`.

Este diseño resolvió el bug crítico donde el servidor se caía después del primer comando: el problema era que el hilo del agente terminaba y cerraba el socket antes de que `/ejecutar` pudiera reutilizarlo.

### 4.3 Cifrado TLS autofirmado

```python
# Servidor
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ctx.load_cert_chain("server.crt", "server.key")

# Agente
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE  # Acepta cert autofirmado
```

Se usaron certificados autofirmados generados con OpenSSL. Para producción real se requeriría una CA reconocida, pero para el entorno de laboratorio esta configuración cifra el canal correctamente.

### 4.4 Estado en memoria

```python
agentes  = {}   # {id: {conn, addr, os, connected_at}}
historial = {}  # {id: [{cmd, result, timestamp}]}
counter  = 0    # ID incremental
lock     = threading.Lock()  # Acceso concurrente seguro
```

Se eligió estado en memoria (sin base de datos) para mantener el proyecto liviano y sin dependencias externas adicionales. La contrapartida es que el estado se pierde si el servidor reinicia.

### 4.5 Agente sin dependencias externas

El agente usa exclusivamente la biblioteca estándar de Python (`socket`, `ssl`, `subprocess`, `platform`, `threading`). Esto lo hace desplegable en cualquier sistema con Python 3.x sin necesidad de instalar paquetes.

### 4.6 Reconexión automática del agente

```python
while True:
    try:
        # conectar y operar
    except Exception:
        time.sleep(5)
        # reintentar
```

Si el servidor se cae o la conexión se interrumpe, el agente reintenta automáticamente cada 5 segundos hasta reconectarse.

---

## 5. Esquema de cifrado TLS

```
Generación de certificados (OpenSSL):
openssl req -x509 -newkey rsa:4096 -keyout server.key 
            -out server.crt -days 365 -nodes

Handshake TLS:
1. Agente inicia TCP connect al servidor
2. Servidor presenta server.crt
3. Agente acepta sin verificar CA (CERT_NONE)
4. Se establece canal cifrado con TLS
5. Todo el tráfico posterior va cifrado
```

El tráfico capturado con Wireshark entre agente y servidor aparece como datos cifrados ilegibles, confirmando la efectividad del canal TLS.

---

## 6. Contenedorización Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY server_c2.py requirements.txt server.crt server.key .
RUN pip install -r requirements.txt
EXPOSE 4444 8000
CMD ["python", "server_c2.py"]
```

El servidor está publicado en Docker Hub como imagen pública:
```bash
docker pull hamminghk/c2-server:latest
docker run -p 4444:4444 -p 8000:8000 hamminghk/c2-server:latest
```

---

## 7. Limitaciones conocidas

| Limitación | Impacto | Mitigación posible |
|------------|---------|-------------------|
| Estado en memoria | Se pierde al reiniciar el servidor | Agregar SQLite o Redis |
| Certificado autofirmado | Agente no valida identidad del servidor | Usar CA real en producción |
| `SERVER_IP` hardcodeado en el agente | Requiere edición manual antes de desplegar | Variable de entorno o argumento CLI |
| Sin autenticación en la API REST | Cualquiera con acceso a puerto 8000 puede operar | Agregar API key o JWT |
| Bug menor: prompt muestra `undefined>` | Visual, no funcional | Corrección en la interfaz React |

---

## 8. Entorno de pruebas

El sistema fue probado en el siguiente entorno:

- **Servidor C2:** Kali Linux 2026.1 (VirtualBox) — Docker Desktop
- **Agente:** Kali Linux (VirtualBox, red bridged) — Python 3.11 stdlib
- **Operador:** Navegador Firefox en Kali Linux — localhost:5173
- **Red:** Red en puente (Bridged Adapter) en VirtualBox — IPs en 192.168.X.X

---

## 9. Flujo end-to-end verificado

```
1. Servidor C2 arranca → escucha en :4444 (TLS) y :8000 (REST)
2. Agente ejecuta → TCP connect + TLS handshake → envía OS
3. Servidor registra agente con ID incremental
4. Operador abre interfaz → GET /agentes → ve Agent-1 online
5. Operador escribe "whoami" → POST /ejecutar
6. Servidor busca conn en agentes{} → conn.send("whoami")
7. Agente ejecuta subprocess.check_output("whoami", shell=True)
8. Agente envía resultado → servidor retorna JSON a la interfaz
9. Interfaz muestra "cisco" (o el usuario del sistema víctima)
10. GET /historial/1 → retorna todos los comandos con timestamps
```

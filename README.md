# 🛡️ Command and Control (C2) — Hackathon TIC Talento Tech

> **Proyecto desarrollado para el reto empresarial de ALIGO Defensores Informáticos**  
> Entorno de laboratorio controlado — no se opera contra sistemas reales.

---

## ¿Qué es este proyecto?

Un sistema **Command and Control (C2)** es una infraestructura usada en ciberseguridad ofensiva y defensiva para coordinar agentes remotos desde un servidor central. Este proyecto implementa un C2 funcional con cifrado TLS, interfaz gráfica de operador, soporte multi-agente y contenedorización Docker.

El operador (atacante simulado) puede:
- Ver todos los agentes conectados en tiempo real
- Ejecutar comandos remotos en cualquier agente
- Enviar comandos a todos los agentes simultáneamente (broadcast)
- Consultar el historial de comandos por agente

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                     OPERADOR                            │
│         Interfaz React  →  localhost:5173               │
└─────────────────────┬───────────────────────────────────┘
                      │  HTTP REST (puerto 8000)
┌─────────────────────▼───────────────────────────────────┐
│                  SERVIDOR C2                            │
│              FastAPI + Uvicorn                          │
│         Docker │ Puerto 8000 (API REST)                 │
│                │ Puerto 4444 (TCP + TLS)                │
└─────────────────────┬───────────────────────────────────┘
                      │  TCP cifrado TLS (puerto 4444)
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │ Agent-1 │  │ Agent-2 │  │ Agent-3 │
   │ Linux   │  │ Linux   │  │ Windows │
   └─────────┘  └─────────┘  └─────────┘
```

### Separación de canales
| Canal | Protocolo | Puerto | Propósito |
|-------|-----------|--------|-----------|
| Agentes | TCP + TLS | 4444 | Comunicación binaria persistente |
| Operador | HTTP REST | 8000 | API para la interfaz gráfica |
| Interfaz | HTTP | 5173 | Panel de control React |

---

## Niveles alcanzados

| Nivel | Descripción | Estado |
|-------|-------------|--------|
| Nivel 1 | Servidor + agente funcional | ✅ |
| Nivel 2 | API REST + reconexión automática del agente | ✅ |
| Nivel 3 | Cifrado TLS del canal de comunicación | ✅ |
| Nivel 4 | Broadcast, historial, interfaz profesional, Docker | ✅ |

---

## Estructura del repositorio

```
Command-and-Control-C2-/
├── Agentes/
│   ├── agente_c2.py          # Agente remoto (solo stdlib Python)
│   └── requirements.txt      # Vacío — sin dependencias externas
├── Server/
│   ├── server_c2.py          # Servidor C2 principal
│   ├── requirements.txt      # fastapi, uvicorn
│   ├── Dockerfile            # Contenedorización del servidor
│   ├── docker-compose.yml
│   ├── server.crt            # Certificado TLS autofirmado
│   └── server.key            # Clave privada TLS
├── src/                      # Interfaz React (generada con v0.dev)
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## Cómo ejecutar el proyecto

### Prerrequisitos
- Docker instalado
- Python 3.11+
- Node.js 20+ y npm

---

### 1. Servidor C2

**Opción A — Con Docker (recomendado):**
```bash
cd Server
docker build -t c2-server .
docker run -p 4444:4444 -p 8000:8000 c2-server
```

**Opción B — Directo con Python:**
```bash
cd Server
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
python server_c2.py
```

El servidor queda escuchando en:
- `0.0.0.0:4444` → canal de agentes (TLS)
- `0.0.0.0:8000` → API REST del operador

---

### 2. Agente remoto

> ⚠️ Antes de correr el agente, edita `agente_c2.py` y cambia `SERVER_IP` por la IP real del servidor.

```bash
cd Agentes

# Editar la IP del servidor:
# SERVER_IP = "192.168.X.X"  ← IP de la máquina donde corre el servidor

python agente_c2.py
```

El agente se conecta automáticamente al servidor via TLS, reporta su sistema operativo y queda en espera de comandos. Si pierde la conexión, reintenta cada 5 segundos.

---

### 3. Interfaz del operador

```bash
# En la raíz del repositorio:
npm install
npm run dev
```

Abrir en el navegador: **http://localhost:5173**

---

## Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/` | Estado del servidor |
| `GET` | `/agentes` | Lista de agentes conectados |
| `POST` | `/ejecutar` | Ejecutar comando en un agente específico |
| `POST` | `/broadcast` | Ejecutar comando en todos los agentes |
| `GET` | `/historial/{id}` | Historial de comandos de un agente |

### Ejemplo — Ejecutar comando:
```json
POST /ejecutar
{
  "agente_id": 1,
  "comando": "whoami"
}
```

### Ejemplo — Broadcast:
```json
POST /broadcast
{
  "comando": "uname -a"
}
```

---

## Stack tecnológico

**Backend — Servidor C2:**
- Python 3.11
- FastAPI + Uvicorn
- `ssl`, `socket`, `threading` (stdlib)
- Docker

**Agente:**
- Python 3.11
- `socket`, `ssl`, `subprocess`, `platform` (stdlib — sin dependencias externas)

**Interfaz del operador:**
- React + Vite
- Tailwind CSS
- Generada con v0.dev

---

## Consideraciones de seguridad

- Este proyecto es exclusivamente para **entornos de laboratorio controlados**
- Los certificados TLS son autofirmados (válidos solo para entornos de prueba)
- `SERVER_IP` en el agente debe configurarse manualmente antes de desplegar
- No operar contra sistemas sin autorización explícita

---

## Autores

Desarrollado por el equipo participante en el Hackathon TIC Talento Tech  
Reto: **Command and Control (C2)** — ALIGO Defensores Informáticos

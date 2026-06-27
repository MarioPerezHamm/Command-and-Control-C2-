FROM python:3.11-slim

WORKDIR /app

COPY server_c2.py .
COPY server.crt .
COPY server.key .

RUN pip install fastapi uvicorn

EXPOSE 4444
EXPOSE 8000

CMD ["python", "server_c2.py"]

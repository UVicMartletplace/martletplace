FROM python:3.12-slim

WORKDIR /app

COPY ./requirements.txt ./
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY ./src ./src

HEALTHCHECK CMD python -c "import requests; response = requests.get('http://localhost:8221/.well-known/health'); exit(0) if response.status_code == 200 else exit(1)"

CMD uvicorn src.server:app --host 0.0.0.0 --port 8221 --reload

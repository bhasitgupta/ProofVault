FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    cryptography \
    pyjwt \
    pyotp \
    qrcode \
    sqlalchemy \
    aiosqlite \
    structlog \
    reportlab \
    jinja2 \
    pymupdf \
    pydantic-settings \
    python-multipart

COPY app ./app
COPY storage ./storage

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

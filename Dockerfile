FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libxrender1 \
    libxext6 \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir fastapi "uvicorn[standard]" pydantic-settings httpx numpy scipy scikit-learn pandas rdkit-pypi

COPY ml/ ml/
COPY apps/api/ apps/api/
COPY data/ data/

ENV PYTHONPATH="/app/ml/src:/app/apps/api"
ENV PORT=7860

EXPOSE 7860 8000

CMD ["sh", "-c", "uvicorn scentiq_api.main:app --host 0.0.0.0 --port ${PORT:-7860}"]

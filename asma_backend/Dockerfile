# Stage 1: build wheels (has compilers, stays out of final image)
FROM python:3.11-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir pipenv

COPY Pipfile Pipfile.lock ./
RUN pipenv requirements | grep -v "backports.zoneinfo" > requirements.txt

RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

# Stage 2: runtime only (no build tools, no compilers)
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /wheels /wheels
COPY --from=builder /app/requirements.txt .
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt \
    && rm -rf /wheels

COPY . .

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
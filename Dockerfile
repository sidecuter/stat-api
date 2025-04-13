FROM alpine:latest

RUN apk add nodejs uv npm python3 bash

WORKDIR /app

COPY . .

RUN npm ci
RUN ./nx install @polyna-backend/fastapi

CMD ["./nx", "run-many", "-t", "run"]

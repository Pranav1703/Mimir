FROM golang:alpine AS builder
RUN apk --no-cache add chromium
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o briefly .

FROM alpine:latest
RUN apk --no-cache add ca-certificates chromium
WORKDIR /app
COPY --from=builder /app/briefly .
COPY --from=builder /app/internal/database/schema.sql ./internal/database/schema.sql
EXPOSE 3002
CMD ["./briefly"]

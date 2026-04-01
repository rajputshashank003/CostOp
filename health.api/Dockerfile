# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY main.go ./

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/cronjob main.go

# Final stage
FROM alpine:latest

# Certificates for external API calls
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy the binary from the builder
COPY --from=builder /app/cronjob .

# Run the cronjob
CMD ["./cronjob"]

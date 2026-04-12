# Docker Build and Deploy for English Learning App

## How to Build and Run with Docker

### 1. Build Docker Image

```bash
docker build -t english-learning:latest .
```

### 2. Run Container

```bash
docker run -d -p 80:80 --name english-learning-web english-learning:latest
```

### 3. Use Docker Compose

```bash
docker compose up -d
```

Container will run on port 80. Access the application at: `http://localhost`

## Dockerfile Structure

- **Stage 1 (Build)**: Use Node.js 20 Alpine to build the Angular application
- **Stage 2 (Production)**: Use Nginx Alpine to serve the built application

## Useful Commands

### View Logs

```bash
docker logs english-learning-web
```

### Stop Container

```bash
docker stop english-learning-web
```

### Remove Container

```bash
docker rm english-learning-web
```

### Remove Image

```bash
docker rmi english-learning:latest
```

### Rebuild and Restart

```bash
docker compose down
docker compose up -d --build
```

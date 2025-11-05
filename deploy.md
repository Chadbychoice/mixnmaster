# MatchMaster Deployment Guide

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- 4GB+ RAM available
- 10GB+ free disk space

### Local Development

1. **Clone and start the services:**
```bash
git clone <your-repo-url>
cd matchmaster
docker-compose up -d
```

2. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

3. **Stop the services:**
```bash
docker-compose down
```

### Production Deployment

#### Option 1: VPS/Cloud Server

1. **Prepare your server:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Deploy the application:**
```bash
git clone <your-repo-url>
cd matchmaster
docker-compose -f docker-compose.prod.yml up -d
```

#### Option 2: AWS/GCP/Azure

1. **Create a VM instance** (recommended: 4GB RAM, 2 vCPUs)
2. **Install Docker and Docker Compose** (see above)
3. **Deploy using the same commands**

#### Option 3: Kubernetes

1. **Create Kubernetes manifests:**
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: matchmaster

# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: matchmaster
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: matchmaster-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: REDIS_URL
          value: "redis://redis:6379"
        volumeMounts:
        - name: uploads
          mountPath: /app/uploads
        - name: outputs
          mountPath: /app/outputs
      volumes:
      - name: uploads
        persistentVolumeClaim:
          claimName: uploads-pvc
      - name: outputs
        persistentVolumeClaim:
          claimName: outputs-pvc
```

## Environment Variables

Create a `.env` file for production:

```env
# Database
REDIS_URL=redis://redis:6379

# File Storage
UPLOAD_DIR=/app/uploads
OUTPUT_DIR=/app/outputs

# Security
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# File Limits
MAX_FILE_SIZE=100MB
MAX_FILES_PER_USER=50
```

## Scaling Considerations

### Horizontal Scaling
- Use Redis Cluster for job queue
- Deploy multiple backend instances
- Use load balancer (nginx/HAProxy)
- Store files in object storage (S3/GCS)

### Vertical Scaling
- Increase RAM for faster processing
- Use faster CPUs for audio processing
- Add SSD storage for better I/O

### Monitoring
- Add Prometheus metrics
- Use Grafana for dashboards
- Monitor Redis queue length
- Track processing times

## Security

### Production Checklist
- [ ] Use HTTPS (Let's Encrypt)
- [ ] Set up firewall rules
- [ ] Use strong secrets
- [ ] Enable Redis AUTH
- [ ] Set file upload limits
- [ ] Add rate limiting
- [ ] Regular security updates

### SSL Certificate
```bash
# Using Let's Encrypt
sudo apt install certbot
sudo certbot --nginx -d yourdomain.com
```

## Backup Strategy

### File Storage
```bash
# Backup uploads and outputs
rsync -av /app/uploads/ /backup/uploads/
rsync -av /app/outputs/ /backup/outputs/
```

### Database
```bash
# Backup Redis data
redis-cli --rdb /backup/redis.rdb
```

## Troubleshooting

### Common Issues

1. **Out of memory errors:**
   - Increase Docker memory limits
   - Use swap space
   - Process files in smaller batches

2. **File upload failures:**
   - Check nginx client_max_body_size
   - Verify disk space
   - Check file permissions

3. **Processing stuck:**
   - Check Redis connection
   - Restart backend services
   - Check logs for errors

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Performance Optimization

### Backend
- Use async file processing
- Implement caching
- Optimize Matchering parameters
- Use connection pooling

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading
- Optimize bundle size

### Infrastructure
- Use SSD storage
- Enable Redis persistence
- Configure nginx caching
- Use HTTP/2


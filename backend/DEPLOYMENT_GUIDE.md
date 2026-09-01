# JanConnect AI - Deployment Guide

Complete guide for deploying JanConnect AI backend to production.

## 📋 Pre-Deployment Checklist

### Security
- [ ] Change all default passwords
- [ ] Set strong `NVIDIA_API_KEY` if using AI features
- [ ] Configure CORS to allow only frontend domain
- [ ] Enable HTTPS/TLS certificates
- [ ] Set `DEBUG=false` in production
- [ ] Review and restrict database access
- [ ] Set up firewall rules
- [ ] Enable rate limiting

### Performance
- [ ] Database indexes created (done by migration)
- [ ] Connection pool configured
- [ ] Set appropriate worker count for uvicorn
- [ ] Configure caching (if using Redis)
- [ ] Set up CDN for static assets (if any)

### Monitoring
- [ ] Configure error tracking (Sentry)
- [ ] Set up logging aggregation
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Create alerting rules

### Backup
- [ ] Configure automated database backups
- [ ] Test backup restoration
- [ ] Document backup schedule
- [ ] Set up off-site backup storage

---

## 🚀 Deployment Options

### Option 1: Docker on Cloud VM (Recommended)

**Suitable for:** Small to medium deployments, full control needed

**Steps:**

1. **Provision Cloud VM**
   ```bash
   # AWS EC2, Google Compute Engine, Azure VM, DigitalOcean Droplet
   # Recommended: 2 vCPU, 4GB RAM, 20GB SSD
   ```

2. **Install Docker**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   sudo apt-get install docker-compose-plugin
   ```

3. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd backend
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env
   ```
   
   Update `.env`:
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:SECURE_PASSWORD@db:5432/janconnect
   NVIDIA_API_KEY=your_production_key
   ENVIRONMENT=production
   DEBUG=false
   ```

5. **Update docker-compose.yml for Production**
   ```yaml
   version: '3.8'
   
   services:
     db:
       image: postgres:15-alpine
       restart: always
       environment:
         POSTGRES_DB: janconnect
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: ${DB_PASSWORD}  # Use secrets
       volumes:
         - postgres_data:/var/lib/postgresql/data
       networks:
         - backend
   
     backend:
       build: .
       restart: always
       ports:
         - "8000:8000"
       environment:
         DATABASE_URL: postgresql+asyncpg://postgres:${DB_PASSWORD}@db:5432/janconnect
         ENVIRONMENT: production
         DEBUG: "false"
       depends_on:
         - db
       networks:
         - backend
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:8000/"]
         interval: 30s
         timeout: 10s
         retries: 3
   
   networks:
     backend:
   
   volumes:
     postgres_data:
   ```

6. **Deploy**
   ```bash
   docker-compose up -d
   docker-compose logs -f  # Monitor logs
   ```

7. **Set Up Nginx Reverse Proxy**
   ```bash
   sudo apt install nginx
   ```
   
   Create `/etc/nginx/sites-available/janconnect`:
   ```nginx
   server {
       listen 80;
       server_name api.janconnect.in;
   
       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
   
   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/janconnect /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Set Up SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.janconnect.in
   ```

---

### Option 2: Cloud Platform as a Service

#### **Render.com** (Easiest)

1. **Create Render Account**: https://render.com

2. **Create PostgreSQL Database**
   - Dashboard → New → PostgreSQL
   - Name: janconnect-db
   - Copy Internal Database URL

3. **Create Web Service**
   - Dashboard → New → Web Service
   - Connect your Git repository
   - Name: janconnect-backend
   - Environment: Docker
   - Instance Type: Starter ($7/month)

4. **Configure Environment Variables**
   ```
   DATABASE_URL=<internal-database-url>
   NVIDIA_API_KEY=your_key
   ENVIRONMENT=production
   DEBUG=false
   ```

5. **Deploy**
   - Render will auto-deploy on git push
   - Access at: https://janconnect-backend.onrender.com

#### **Railway.app**

1. **Create Railway Account**: https://railway.app

2. **Create New Project**
   - New Project → Deploy from GitHub repo
   - Select your repository

3. **Add PostgreSQL**
   - Add Plugin → PostgreSQL
   - Copy DATABASE_URL

4. **Configure Environment**
   - Settings → Variables
   - Add: DATABASE_URL, NVIDIA_API_KEY, etc.

5. **Deploy**
   - Auto-deploys on git push
   - Get public URL from dashboard

#### **Heroku**

1. **Install Heroku CLI**
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login and Create App**
   ```bash
   heroku login
   heroku create janconnect-backend
   ```

3. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NVIDIA_API_KEY=your_key
   heroku config:set ENVIRONMENT=production
   heroku config:set DEBUG=false
   ```

5. **Create Procfile**
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

6. **Deploy**
   ```bash
   git push heroku main
   heroku logs --tail
   ```

---

### Option 3: Serverless (AWS Lambda + RDS)

**Suitable for:** Variable traffic, pay-per-use

1. **Set Up RDS PostgreSQL**
   - AWS Console → RDS → Create Database
   - Engine: PostgreSQL 15
   - Template: Free tier / Production
   - Enable public access for setup (restrict later)

2. **Install Mangum (ASGI adapter)**
   ```bash
   pip install mangum
   echo "mangum==0.17.0" >> requirements.txt
   ```

3. **Update main.py**
   ```python
   from mangum import Mangum
   
   # ... existing code ...
   
   # Add at end of file
   handler = Mangum(app)
   ```

4. **Create Lambda Deployment Package**
   ```bash
   pip install -r requirements.txt -t package/
   cp -r app package/
   cd package && zip -r ../deployment.zip . && cd ..
   ```

5. **Deploy to Lambda**
   - AWS Console → Lambda → Create Function
   - Runtime: Python 3.11
   - Upload deployment.zip
   - Set environment variables
   - Set timeout: 30 seconds
   - Set memory: 512 MB

6. **Create API Gateway**
   - API Gateway → Create API → HTTP API
   - Add Lambda integration
   - Create routes: ANY /{proxy+}
   - Deploy

---

### Option 4: Kubernetes (Production Scale)

**Suitable for:** Large deployments, high availability

See separate `k8s/` directory for Kubernetes manifests.

---

## 🗄️ Database Deployment

### Managed Database Services (Recommended)

#### **Supabase** (Free tier available)
```bash
# 1. Create project at supabase.com
# 2. Go to Project Settings → Database
# 3. Copy Session Pooler connection string
# 4. Update DATABASE_URL in .env
DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

#### **AWS RDS**
```bash
# 1. AWS Console → RDS → Create Database
# 2. Engine: PostgreSQL 15
# 3. Template: Production / Dev/Test
# 4. Instance: db.t3.micro (free tier) or larger
# 5. Enable automated backups
# 6. Copy endpoint
DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@[ENDPOINT]:5432/janconnect
```

#### **Google Cloud SQL**
```bash
# 1. GCP Console → SQL → Create Instance
# 2. Choose PostgreSQL
# 3. Set instance ID, password
# 4. Enable Cloud SQL Proxy for secure connection
DATABASE_URL=postgresql+asyncpg://postgres:[PASSWORD]@/janconnect?host=/cloudsql/[CONNECTION_NAME]
```

---

## 🔒 Security Hardening

### 1. Update CORS Settings

Edit `app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://janconnect.in",
        "https://www.janconnect.in",
        "https://app.janconnect.in"
    ],  # Restrict to your frontend domains
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Only needed methods
    allow_headers=["*"],
)
```

### 2. Add Rate Limiting

```bash
pip install slowapi
```

Update `app/main.py`:
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add to routes
@router.post("/api/complaints")
@limiter.limit("10/minute")
async def submit_complaint(...):
    ...
```

### 3. Set Up Secrets Management

**AWS Secrets Manager:**
```bash
# Store DATABASE_URL
aws secretsmanager create-secret \
    --name janconnect/database-url \
    --secret-string "postgresql+asyncpg://..."

# Retrieve in app
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='janconnect/database-url')
DATABASE_URL = secret['SecretString']
```

### 4. Enable HTTPS Only

In Nginx:
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/api.janconnect.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.janconnect.in/privkey.pem;
    
    # Redirect HTTP to HTTPS
    if ($scheme != "https") {
        return 301 https://$server_name$request_uri;
    }
}
```

---

## 📊 Monitoring Setup

### Sentry (Error Tracking)

```bash
pip install sentry-sdk[fastapi]
```

Update `app/main.py`:
```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    environment=settings.environment,
    traces_sample_rate=0.1,
)
```

### Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/janconnect/app.log'),
        logging.StreamHandler()
    ]
)
```

### Health Checks

Create `/health` endpoint for monitoring:
```python
@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute("SELECT 1")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Your deployment script
          ssh user@server 'cd /app && git pull && docker-compose up -d --build'
```

---

## 📦 Database Migrations in Production

```bash
# Always test migrations on staging first!

# 1. Backup database
pg_dump -h <host> -U postgres janconnect > backup_$(date +%Y%m%d).sql

# 2. Run migration
alembic upgrade head

# 3. Verify
alembic current

# 4. If issues, rollback
alembic downgrade -1
```

---

## 🚨 Rollback Plan

If deployment fails:

```bash
# Docker
docker-compose down
git checkout <previous-commit>
docker-compose up -d --build

# Database
psql -h <host> -U postgres janconnect < backup_YYYYMMDD.sql
alembic downgrade <previous-version>
```

---

## 📈 Scaling Strategies

### Vertical Scaling (Easy)
- Increase VM size (more CPU/RAM)
- Upgrade database instance
- No code changes needed

### Horizontal Scaling (Better)
```
Load Balancer (Nginx/ALB)
    │
    ├─► FastAPI Instance 1
    ├─► FastAPI Instance 2
    └─► FastAPI Instance 3
         │
         └─► PostgreSQL (single primary)
```

### Add Caching (Redis)
```python
# pip install redis aioredis
from redis import asyncio as aioredis

redis = await aioredis.from_url("redis://localhost")

@app.get("/api/dashboard/summary")
async def summary(db: AsyncSession = Depends(get_db)):
    # Try cache first
    cached = await redis.get("dashboard:summary")
    if cached:
        return json.loads(cached)
    
    # Compute and cache
    result = await compute_summary(db)
    await redis.setex("dashboard:summary", 300, json.dumps(result))
    return result
```

---

## ✅ Post-Deployment Verification

```bash
# 1. Health check
curl https://api.janconnect.in/

# 2. Test API
curl -X POST https://api.janconnect.in/api/complaints \
  -H "Content-Type: application/json" \
  -d '{"ward_id":1,"raw_text":"Test","language":"English","channel":"text"}'

# 3. Check logs
docker-compose logs -f backend

# 4. Monitor database
psql -h <host> -U postgres janconnect -c "SELECT COUNT(*) FROM complaints;"

# 5. Check SSL
curl -I https://api.janconnect.in/

# 6. Test performance
ab -n 100 -c 10 https://api.janconnect.in/
```

---

## 📞 Support & Troubleshooting

Common production issues:

### Database Connection Timeouts
```python
# Increase pool size in database.py
engine = create_async_engine(
    settings.database_url,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
)
```

### High Memory Usage
```bash
# Reduce worker count
uvicorn app.main:app --workers 2

# Or use gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Slow Queries
```sql
-- Enable query logging in PostgreSQL
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log queries > 1s
SELECT pg_reload_conf();

-- Check slow queries
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
```

---

## 🎯 Production Checklist

Before going live:

- [ ] All tests passing
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] CORS configured for frontend domain
- [ ] HTTPS enabled
- [ ] Error tracking configured (Sentry)
- [ ] Logging set up
- [ ] Monitoring dashboards created
- [ ] Backup schedule configured
- [ ] Load testing completed
- [ ] Security scan performed
- [ ] Documentation updated
- [ ] Rollback plan tested
- [ ] Team trained on deployment process

---

**Good luck with your deployment! 🚀**

For questions or issues, refer to the main documentation or create an issue in the repository.

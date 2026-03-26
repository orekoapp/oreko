# Docker Deployment Guide

Self-host QuoteCraft using Docker. Two deployment options are available:

| Option | File | What you get |
|--------|------|-------------|
| **Simple** | `docker-compose.simple.yml` | Web app + PostgreSQL on port 3000 |
| **Production** | `docker-compose.prod.yml` | Web app + PostgreSQL + Traefik (auto SSL) |

---

## Prerequisites

### Supported Operating Systems

| OS | Version | Notes |
|----|---------|-------|
| Ubuntu | 20.04+ (LTS recommended) | Best supported, recommended for production |
| Debian | 11+ (Bullseye) | Fully supported |
| CentOS / RHEL | 8+ | Use `dnf` instead of `apt` for package installation |
| macOS | 12+ (Monterey) | Via Docker Desktop, good for local testing |
| Windows | 10/11 Pro or Home | Via Docker Desktop with WSL 2 backend |

### Software Requirements

| Software | Minimum Version | Check with |
|----------|----------------|------------|
| Git | 2.0+ | `git --version` |
| Docker Engine | 24.0+ | `docker --version` |
| Docker Compose | **v2** (ships with Docker Desktop) | `docker compose version` |

> **Compose v1 vs v2:** This guide uses `docker compose` (v2, with a space). If you see `docker-compose` (v1, with a hyphen) in older tutorials, it is deprecated. All commands in this guide use v2 syntax.

### Hardware Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 2 GB (running) / 4 GB (building) | 4 GB+ |
| Disk | 5 GB | 20 GB+ (room for database growth, backups, Docker cache) |
| CPU | 1 core | 2+ cores |

---

## Quick Start (Simple Setup)

Best for: local testing, small teams behind a VPN, or when you already have a reverse proxy (nginx, Caddy, Cloudflare Tunnel).

### 1. Clone the repository

```bash
git clone https://github.com/oreko/oreko.git  # Update this URL once the repo is created
cd oreko
```


### 2. Create your `.env` file

Copy the example and fill in the required values:

```bash
cp .env.example .env
```

At minimum, set these variables:

```env
# Required
POSTGRES_PASSWORD=your-strong-password-here
NEXTAUTH_SECRET=your-random-secret-here

# Optional (defaults shown)
POSTGRES_USER=quotecraft
POSTGRES_DB=quotecraft
NEXTAUTH_URL=http://localhost:3000
```

**Generating a secure `NEXTAUTH_SECRET`:**

```bash
openssl rand -base64 32
```

This produces a 44-character base64 string (256 bits of entropy). This is the minimum recommended strength — do not use short or guessable strings. The secret is used to sign and encrypt JWTs; a weak secret means anyone can forge login tokens.

### 3. Build and start

```bash
docker compose -f docker-compose.simple.yml up -d
```

This will:
- Build the QuoteCraft image (~2-3 minutes on first run)
- Start PostgreSQL 16
- Wait for the database to be healthy
- Start the web application on port 3000

### 4. Run database migrations

After the containers are running, apply the database schema:

```bash
docker run --rm \
  --network quotecraft-network \
  -v ./packages/database/prisma:/prisma \
  -e DATABASE_URL="postgresql://quotecraft:YOUR_PASSWORD@postgres:5432/quotecraft?schema=public" \
  node:20-alpine \
  sh -c "npx prisma@6.19.2 migrate deploy --schema=/prisma/schema.prisma"
```

Replace `YOUR_PASSWORD` with the `POSTGRES_PASSWORD` you set in `.env`.

### 5. Open the app

Go to **http://localhost:3000** and register your first account.

### 6. (Optional) Seed demo data

If you want sample clients, quotes, and invoices to explore:

```bash
docker run --rm \
  --network quotecraft-network \
  -v ./packages/database:/database \
  -e DATABASE_URL="postgresql://quotecraft:YOUR_PASSWORD@postgres:5432/quotecraft?schema=public" \
  node:20-alpine \
  sh -c "cd /database && npx tsx prisma/seed.ts"
```

---

## Production Setup (with SSL)

For a production deployment with automatic HTTPS via Traefik.

### 1. Clone the repository on your server

```bash
git clone https://github.com/oreko/oreko.git  # Update this URL once the repo is created
cd oreko
```

### 2. Set up DNS

**Do this before anything else.** Point your domain's A record to your server's IP address:

```
yourdomain.com  →  A  →  203.0.113.10  (your server IP)
```

DNS propagation can take **5 minutes to 48 hours**. Verify it has propagated before proceeding:

```bash
dig +short yourdomain.com
# Should return your server's IP
```

If you skip this step, Traefik will fail to obtain SSL certificates from Let's Encrypt and you'll see `ACME challenge failed` errors in the Traefik logs. Let's Encrypt needs to reach your server via the domain to verify ownership.

### 3. Configure firewall

Open only the ports you need:

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 22/tcp    # SSH — restrict to your IP if possible
sudo ufw allow 80/tcp    # HTTP (Traefik redirects to HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

**Do NOT expose:**
- Port 5432 (PostgreSQL) — only accessible within the Docker network
- Port 3000 (app) — Traefik handles external traffic on 80/443

### 4. Set environment variables

```env
# Required
POSTGRES_PASSWORD=your-strong-password-here
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=https://yourdomain.com
DATABASE_URL=postgresql://quotecraft:YOUR_PASSWORD@postgres:5432/quotecraft?schema=public

# Domain & SSL
DOMAIN=yourdomain.com
ACME_EMAIL=your-email@example.com

# Traefik dashboard auth (optional, see "Traefik Dashboard" section below)
# TRAEFIK_BASIC_AUTH=admin:$$apr1$$...
```

### 5. Build and start

```bash
docker compose -f docker-compose.prod.yml up -d
```

This starts:
- **Web app** — behind Traefik, no exposed ports
- **PostgreSQL** — internal only, with backup volume at `./backups`
- **Traefik** — ports 80 (redirects to 443) and 443 (HTTPS with Let's Encrypt)

### 6. Run migrations

Same as simple setup, but use your production `DATABASE_URL`.

### 7. Verify SSL

```bash
curl -I https://yourdomain.com
# Should return HTTP/2 200 with no SSL errors
```

If SSL isn't working, check Traefik logs:

```bash
docker logs quotecraft-traefik 2>&1 | grep -i "acme\|error\|challenge"
```

Common causes: DNS not propagated yet, port 80 blocked by firewall, domain doesn't resolve to this server.

---

## Traefik Dashboard

The production compose file includes a Traefik admin dashboard at `https://traefik.yourdomain.com`. It shows active routes, services, and SSL certificate status.

**To enable it:**

1. Set up a DNS record for `traefik.yourdomain.com` pointing to the same server
2. Generate basic auth credentials:
   ```bash
   # Install htpasswd (part of apache2-utils)
   sudo apt install apache2-utils

   # Generate credentials
   htpasswd -nb admin your-secure-password
   # Output: admin:$apr1$xyz...
   ```
3. Add to `.env` (double the `$` signs for Docker Compose escaping):
   ```env
   TRAEFIK_BASIC_AUTH=admin:$$apr1$$xyz...
   ```

**Security note:** The dashboard exposes your routing configuration. If you don't need it, remove the `traefik.http.routers.dashboard.*` labels from `docker-compose.prod.yml` entirely. Never expose it without authentication.

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_PASSWORD` | Yes | — | Database password |
| `POSTGRES_USER` | No | `quotecraft` | Database user |
| `POSTGRES_DB` | No | `quotecraft` | Database name |
| `NEXTAUTH_SECRET` | Yes | — | Auth encryption key — **must be at least 32 characters**. Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | No | `http://localhost:3000` | Public URL of your instance |
| `AUTH_TRUST_HOST` | No | `true` (set in compose) | Trust the host header for auth |
| `STRIPE_SECRET_KEY` | No | — | Stripe payments (optional) |
| `STRIPE_WEBHOOK_SECRET` | No | — | Stripe webhooks (optional) |
| `RESEND_API_KEY` | No | — | Email via Resend (optional) |
| `REDIS_URL` | No | — | Redis for rate limiting (optional, falls back to in-memory) |
| `DOMAIN` | Prod only | — | Your domain for Traefik SSL |
| `ACME_EMAIL` | Prod only | — | Email for Let's Encrypt certificate expiry notifications |

---

## Health Checks

The app exposes a health endpoint at `/api/health`. Use it to verify the app and database are working:

```bash
curl http://localhost:3000/api/health
```

**Healthy response** (HTTP 200):

```json
{
  "status": "healthy",
  "timestamp": "2026-03-26T10:15:41.459Z",
  "services": {
    "database": "connected"
  }
}
```

**Unhealthy response** (HTTP 503):

```json
{
  "status": "unhealthy",
  "timestamp": "2026-03-26T10:15:41.459Z",
  "services": {
    "database": "disconnected"
  },
  "error": "Database connection failed"
}
```

**Rate limited** (HTTP 429) — the health endpoint allows 60 requests per minute:

```json
{
  "status": "rate_limited"
}
```

If you get an unhealthy response, check:

1. Is PostgreSQL running? `docker ps | grep postgres`
2. Can the web container reach it? `docker logs quotecraft-web 2>&1 | tail -20`
3. Is the `DATABASE_URL` correct in the web container environment?

---

## Monitoring

### Basic: health check script

Create a script that alerts you if the app goes down. Save as `/opt/quotecraft/healthcheck.sh`:

```bash
#!/bin/bash
HEALTH_URL="http://localhost:3000/api/health"
ALERT_EMAIL="you@example.com"

response=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" --max-time 10)

if [ "$response" != "200" ]; then
  echo "QuoteCraft is DOWN (HTTP $response) at $(date)" | \
    mail -s "ALERT: QuoteCraft Down" "$ALERT_EMAIL"
fi
```

Run it every 2 minutes via cron:

```bash
crontab -e
# Add:
*/2 * * * * /opt/quotecraft/healthcheck.sh
```

### Docker restart policy

The compose files already use `restart: unless-stopped`, so Docker will automatically restart crashed containers. To verify:

```bash
# Check restart count
docker inspect quotecraft-web --format='{{.RestartCount}}'

# If restart count is climbing, check logs for the crash reason
docker logs quotecraft-web --tail 50
```

### Log rotation

Docker logs grow unbounded by default and can fill your disk. Configure log rotation in `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Then restart Docker:

```bash
sudo systemctl restart docker
```

This limits each container to 3 log files of 10 MB each (30 MB max per container). Existing containers need to be recreated to pick up the new settings:

```bash
docker compose -f docker-compose.simple.yml down
docker compose -f docker-compose.simple.yml up -d
```

---

## Database Backups

### Create a manual backup

```bash
docker exec quotecraft-postgres pg_dump -U quotecraft quotecraft > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Automated daily backups

Create a backup script at `/opt/quotecraft/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/opt/quotecraft/backups"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

# Create compressed backup
docker exec quotecraft-postgres pg_dump -U quotecraft quotecraft | \
  gzip > "$BACKUP_DIR/quotecraft_$(date +%Y%m%d_%H%M%S).sql.gz"

# Delete backups older than retention period
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup complete: $(ls -lh $BACKUP_DIR/*.sql.gz | tail -1)"
```

Schedule it to run daily at 2 AM:

```bash
chmod +x /opt/quotecraft/backup.sh
crontab -e
# Add:
0 2 * * * /opt/quotecraft/backup.sh >> /var/log/quotecraft-backup.log 2>&1
```

### Off-server backup storage

Local backups are useless if the server dies. Copy backups to an external location:

```bash
# Option 1: rsync to another server
rsync -az /opt/quotecraft/backups/ user@backup-server:/backups/quotecraft/

# Option 2: Upload to S3 (or any S3-compatible storage like Backblaze B2)
aws s3 sync /opt/quotecraft/backups/ s3://your-bucket/quotecraft-backups/

# Option 3: Upload to Google Cloud Storage
gsutil -m rsync -r /opt/quotecraft/backups/ gs://your-bucket/quotecraft-backups/
```

Add one of these to your cron job after the backup command.

### Restore from backup

**Important:** Stop the web app before restoring to prevent data corruption from active writes.

```bash
# 1. Stop the web container
docker stop quotecraft-web

# 2. Drop and recreate the database
docker exec quotecraft-postgres psql -U quotecraft -d postgres -c "DROP DATABASE quotecraft;"
docker exec quotecraft-postgres psql -U quotecraft -d postgres -c "CREATE DATABASE quotecraft;"

# 3. Restore the backup
# From a .sql file:
cat backup_20260326.sql | docker exec -i quotecraft-postgres psql -U quotecraft quotecraft

# From a .sql.gz file:
gunzip -c quotecraft_20260326_020000.sql.gz | docker exec -i quotecraft-postgres psql -U quotecraft quotecraft

# 4. Start the web container
docker start quotecraft-web
```

---

## Updating QuoteCraft

When a new version is released, follow these steps to update your instance.

### 1. Backup first

Always create a backup before updating (see Backups section above):

```bash
docker exec quotecraft-postgres pg_dump -U quotecraft quotecraft | \
  gzip > pre-update-backup_$(date +%Y%m%d).sql.gz
```

### 2. Pull the latest code

```bash
cd /path/to/oreko
git pull origin main
```

### 3. Rebuild and restart

```bash
# Rebuild the image with new code
docker compose -f docker-compose.simple.yml build

# Restart with the new image
docker compose -f docker-compose.simple.yml up -d
```

### 4. Run new migrations

If the update includes database changes:

```bash
docker run --rm \
  --network quotecraft-network \
  -v ./packages/database/prisma:/prisma \
  -e DATABASE_URL="postgresql://quotecraft:YOUR_PASSWORD@postgres:5432/quotecraft?schema=public" \
  node:20-alpine \
  sh -c "npx prisma@6.19.2 migrate deploy --schema=/prisma/schema.prisma"
```

### 5. Verify

```bash
curl http://localhost:3000/api/health
# Should return: {"status":"healthy",...}
```

### Rollback

If something goes wrong after updating:

```bash
# 1. Stop the app
docker compose -f docker-compose.simple.yml down

# 2. Go back to the previous version
git checkout <previous-commit-hash>

# 3. Restore the database backup (see Restore section)

# 4. Rebuild and start
docker compose -f docker-compose.simple.yml build
docker compose -f docker-compose.simple.yml up -d
```

---

## Security Checklist

Before going live, verify these:

- [ ] **`NEXTAUTH_SECRET`** is at least 32 characters (generated with `openssl rand -base64 32`)
- [ ] **`POSTGRES_PASSWORD`** is strong and unique (not `password123`)
- [ ] **Firewall** only allows ports 22, 80, and 443 (see firewall section)
- [ ] **PostgreSQL** is NOT exposed to the internet (no port 5432 mapping in prod compose)
- [ ] **SSH** uses key-based auth (disable password login in `/etc/ssh/sshd_config`)
- [ ] **HTTPS** is working and redirecting from HTTP
- [ ] **Traefik dashboard** is either disabled or protected with basic auth
- [ ] **Backups** are running and stored off-server
- [ ] **Log rotation** is configured to prevent disk fill

---

## Common Commands

```bash
# Start containers
docker compose -f docker-compose.simple.yml up -d

# Stop containers (preserves data)
docker compose -f docker-compose.simple.yml down

# Stop and DELETE all data (database, volumes — destructive!)
docker compose -f docker-compose.simple.yml down -v

# View live logs
docker logs quotecraft-web -f
docker logs quotecraft-postgres -f

# Rebuild after code changes
docker compose -f docker-compose.simple.yml build
docker compose -f docker-compose.simple.yml up -d

# Check container status
docker ps

# Check health
curl http://localhost:3000/api/health

# Open a shell in the web container
docker exec -it quotecraft-web sh

# Access the database directly
docker exec -it quotecraft-postgres psql -U quotecraft -d quotecraft
```

---

## Development with Docker

For local development, use the base `docker-compose.yml` which runs only supporting services (PostgreSQL + Mailpit for email testing):

```bash
# Start dev services
docker compose up -d

# Run the app locally with pnpm
pnpm dev
```

This gives you:
- PostgreSQL on `localhost:5432`
- Mailpit UI on `localhost:8025` (email inbox)
- Mailpit SMTP on `localhost:1025`

---

## Troubleshooting

### Build fails with "out of disk space"

Docker build cache can grow large. Free space with:

```bash
docker system prune -a
```

This removes all unused images, containers, and build cache. Running containers are not affected.

### "UntrustedHost" errors in logs

Make sure `AUTH_TRUST_HOST: "true"` is set in the web service environment (already set in `docker-compose.simple.yml`).

### Database connection refused

The web container waits for PostgreSQL to be healthy before starting. If you see connection errors:

```bash
# Check postgres is running
docker ps
docker logs quotecraft-postgres
```

### Migrations fail with "prisma@7.x" errors

The migration command must pin Prisma to the version used in the project. If you run `npx prisma` without a version, it downloads the latest (v7+) which has breaking changes:

```bash
# Wrong — downloads latest (v7), breaks
npx prisma migrate deploy --schema=/prisma/schema.prisma

# Correct — pins to project version
npx prisma@6.19.2 migrate deploy --schema=/prisma/schema.prisma
```

### SSL certificate not working (production)

1. Verify DNS has propagated: `dig +short yourdomain.com` should return your server IP
2. Verify port 80 is open: `curl http://yourdomain.com` should respond (Traefik needs port 80 for the ACME HTTP challenge)
3. Check Traefik logs: `docker logs quotecraft-traefik 2>&1 | grep -i acme`
4. If you just set up DNS, wait 10-30 minutes and try again

### Container won't start on Windows (WSL errors)

- Close unnecessary applications to free RAM
- Restart Docker Desktop
- Ensure WSL 2 is enabled: `wsl --set-default-version 2`

---

## Architecture

The Docker build uses a **3-stage multi-stage build** for optimal image size:

```
Stage 1: deps     — Install dependencies (hoisted node_modules)
Stage 2: builder  — Generate Prisma client, build Next.js (standalone output)
Stage 3: runner   — Minimal Alpine image with only production files (~630 MB)
```

The final image runs as a non-root user (`nextjs:nodejs`) on port 3000.

### Compose files

| File | Purpose | Services |
|------|---------|----------|
| `docker-compose.yml` | Local development | PostgreSQL + Mailpit |
| `docker-compose.simple.yml` | Simple production | Web + PostgreSQL |
| `docker-compose.prod.yml` | Full production | Web + PostgreSQL + Traefik (SSL) |

# 🚀 Production Deployment & Infrastructure

## Infrastructure Stack

- **Frontend / API**: Next.js App Router (Node.js 20 containerized runner)
- **Database**: PostgreSQL 15 + PostGIS 3.3
- **Cache & Pub/Sub**: Redis 7
- **Reverse Proxy / Load Balancer**: Nginx / Cloudflare WAF

---

## Environment Variables (.env)

Ensure all variables in `.env.example` are configured before deployment:
- `DATABASE_URL`
- `REDIS_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_MAP_STYLE`

---

## Docker Compose Production Command

```bash
docker-compose -f docker-compose.yml up --build -d
```

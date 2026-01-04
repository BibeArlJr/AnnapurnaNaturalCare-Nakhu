## Deployment Guide (Frontend & Backend)

### Requirements
- Node.js 20.x
- npm

### Backend (.env)
Copy `backend/.env.example` to `backend/.env` and fill:
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `FRONTEND_BASE_URL`
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` (if payments)
- `SMTP_*` (if emails)

### Backend commands
```bash
cd backend
npm install
npm start           # runs NODE_ENV=production node src/server.js
```

### Frontend (.env)
Create `frontend/.env.production`:
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
NODE_ENV=production
```

### Frontend commands
```bash
cd frontend
npm install
npm run build
npm start           # serves on port 3000
```

### Notes
- CORS is restricted to `FRONTEND_BASE_URL`.
- Replace any localhost URLs in deployments with your live domains.
- Do not commit build artifacts like `.next/`.

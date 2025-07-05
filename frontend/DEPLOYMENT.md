# Frontend Deployment Guide

This guide covers deploying the AI Image Generation Frontend to various platforms.

## 🚀 Quick Deploy Options

### 1. Netlify (Recommended for beginners)

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `build` folder to the deploy area
   - Your site will be live instantly!

3. **Configure environment variables:**
   - Go to Site Settings > Environment Variables
   - Add `REACT_APP_API_BASE` with your backend URL

### 2. Vercel (Recommended for React apps)

1. **Connect your repository:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect it's a React app

2. **Configure environment variables:**
   - Add `REACT_APP_API_BASE` in the project settings
   - Set it to your backend URL

3. **Deploy:**
   - Every push to main branch auto-deploys
   - Preview deployments for pull requests

### 3. GitHub Pages

1. **Add homepage to package.json:**
   ```json
   {
     "homepage": "https://yourusername.github.io/your-repo-name"
   }
   ```

2. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add deploy scripts to package.json:**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     }
   }
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

## 🌐 Production Configuration

### Environment Variables

Create a `.env.production` file:

```env
REACT_APP_API_BASE=https://your-backend-domain.com
```

### Build Optimization

1. **Optimize bundle size:**
   ```bash
   npm run build
   ```

2. **Analyze bundle:**
   ```bash
   npm install --save-dev source-map-explorer
   npx source-map-explorer 'build/static/js/*.js'
   ```

### Performance Tips

1. **Enable compression** (if using nginx):
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript;
   ```

2. **Set cache headers:**
   ```nginx
   location /static/ {
     expires 1y;
     add_header Cache-Control "public, immutable";
   }
   ```

## 🐳 Docker Deployment

### Create Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Create nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Build and run

```bash
docker build -t ai-image-frontend .
docker run -p 80:80 ai-image-frontend
```

## ☁️ Cloud Platform Deployments

### AWS S3 + CloudFront

1. **Create S3 bucket:**
   ```bash
   aws s3 mb s3://your-app-name
   ```

2. **Upload build files:**
   ```bash
   aws s3 sync build/ s3://your-app-name --delete
   ```

3. **Configure CloudFront:**
   - Create distribution pointing to S3 bucket
   - Set index document to `index.html`
   - Configure error pages to redirect to `index.html`

### Google Cloud Platform

1. **Deploy to App Engine:**
   ```bash
   gcloud app deploy
   ```

2. **Or use Firebase Hosting:**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

### Azure

1. **Deploy to Azure Static Web Apps:**
   - Connect GitHub repository
   - Azure will auto-build and deploy
   - Configure environment variables in Azure portal

## 🔧 Backend Integration

### CORS Configuration

Ensure your backend allows requests from your frontend domain:

```python
# Flask backend
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=['https://your-frontend-domain.com'])
```

### Environment Variables

Set the correct backend URL in your frontend:

```env
# Development
REACT_APP_API_BASE=http://localhost:5000

# Production
REACT_APP_API_BASE=https://your-backend-domain.com
```

## 📊 Monitoring & Analytics

### Add Google Analytics

1. **Install package:**
   ```bash
   npm install react-ga
   ```

2. **Initialize in App.tsx:**
   ```typescript
   import ReactGA from 'react-ga';
   
   ReactGA.initialize('GA_TRACKING_ID');
   ```

### Error Monitoring

1. **Add Sentry:**
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

2. **Initialize in index.tsx:**
   ```typescript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: "YOUR_SENTRY_DSN",
     integrations: [new Sentry.BrowserTracing()],
   });
   ```

## 🔒 Security Considerations

### HTTPS Only

- Force HTTPS redirects
- Set HSTS headers
- Use secure cookies

### Content Security Policy

Add CSP headers:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
```

### Environment Variables

- Never commit `.env` files
- Use platform-specific secret management
- Rotate API keys regularly

## 🚀 Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './build'
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 📞 Support

For deployment issues:
1. Check the platform-specific documentation
2. Verify environment variables are set correctly
3. Ensure backend is accessible from frontend domain
4. Check browser console for errors 
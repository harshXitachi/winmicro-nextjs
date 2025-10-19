# AWS Deployment Guide for Next.js

## Option 1: AWS Amplify (Recommended)

### Step 1: Install AWS Amplify CLI
```bash
npm install -g @aws-amplify/cli
```

### Step 2: Initialize Amplify
```bash
amplify init
```
When prompted:
- Project name: `winmicro`
- Environment: `prod`
- Editor: Choose your preference
- App type: `javascript`
- Framework: `nextjs`
- Source directory path: `./`
- Distribution directory path: `./.next`
- Build command: `npm run build`
- Start command: `npm start`

### Step 3: Add Hosting
```bash
amplify add hosting
```
- Select: `Hosting with Amplify Console`
- Choose: `Manual deployment` or `Git-based deployments`

### Step 4: Deploy
```bash
amplify publish
```

---

## Option 2: AWS AppRunner (Docker-based)

### Step 1: Create Dockerfile
Create a `Dockerfile` in your project root:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Step 2: Create .dockerignore
```
node_modules
.next
.git
.gitignore
README.md
.env.local
```

### Step 3: Push to ECR (Elastic Container Registry)
```bash
# Create ECR repository
aws ecr create-repository --repository-name microwin --region eu-north-1

# Build and push
aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.eu-north-1.amazonaws.com
docker build -t microwin .
docker tag microwin:latest <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.eu-north-1.amazonaws.com/microwin:latest
docker push <YOUR_AWS_ACCOUNT_ID>.dkr.ecr.eu-north-1.amazonaws.com/microwin:latest
```

### Step 4: Create AppRunner Service
- Go to AWS AppRunner console
- Click "Create service"
- Select "ECR private repository"
- Choose the image you just pushed
- Configure: Port `3000`
- Set environment variables (from `.env.local`)
- Create and deploy

---

## Environment Variables on AWS

Set your environment variables in AWS:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Any other variables from your `.env.local`

---

## Quick Comparison

| Method | Ease | Cost | Best For |
|--------|------|------|----------|
| **Amplify** | ⭐⭐⭐⭐⭐ | Very Low | Simple Next.js apps |
| **AppRunner** | ⭐⭐⭐ | Low-Medium | Containerized apps |
| **EC2** | ⭐⭐ | Medium-High | Complex setups |

**Recommendation**: Use **AWS Amplify** for fastest, easiest deployment.

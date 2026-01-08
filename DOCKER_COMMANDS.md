# Docker & Commands Reference - Task Management Project

## Table of Contents
1. [Project Initialization](#project-initialization)
2. [Dependency Installation](#dependency-installation)
3. [Prisma Setup](#prisma-setup)
4. [Generate NestJS Resources](#generate-nestjs-resources)
5. [Database Migrations](#database-migrations)
6. [Docker Commands](#docker-commands)
7. [Prisma Studio](#prisma-studio)
8. [Database Queries](#database-queries)
9. [Workflow Scenarios](#workflow-scenarios)
10. [Troubleshooting](#troubleshooting)

---

## Project Initialization

```powershell
# Install NestJS CLI globally (if not already installed)
npm install -g @nestjs/cli

# Create new NestJS project
nest new task-management

# Navigate to project
cd task-management
```

---

## Dependency Installation

```powershell
# Install Prisma and PostgreSQL adapter (Prisma 7 requirements)
npm install prisma @prisma/client @prisma/adapter-pg pg

# Install Prisma as dev dependency
npm install -D prisma

# Install validation dependencies
npm install class-validator class-transformer
```

---

## Prisma Setup

```powershell
# Initialize Prisma with PostgreSQL
npx prisma init --datasource-provider postgresql

# Generate Prisma Client
npx prisma generate

# Generate Prisma Client inside Docker container
docker-compose exec app npx prisma generate
```

### Manual File Creation

**1. Create prisma.config.ts** (in project root)
```typescript
import { defineConfig } from '@prisma/adapter-pg'

export default defineConfig({
  datasourceUrl: process.env.DATABASE_URL,
})
```

**2. Create .env file** (in project root)
```env
DATABASE_URL="postgresql://postgres:Mohith@2006@postgres:5432/taskdb"
```

**3. Create Dockerfile** (in project root)
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma.config.ts ./
COPY prisma ./prisma/

RUN npx prisma generate

COPY . .

EXPOSE 3000
EXPOSE 5555

CMD ["npm", "run", "start:dev"]
```

**4. Create docker-compose.yml** (in project root)


**5. Create .dockerignore** (in project root)
```
node_modules
dist
.env
.git
.gitignore
README.md
```



**Edit prisma/schema.prisma** - remove `url` from datasource (Prisma 7 uses prisma.config.ts):
```prisma
datasource db {
  provider = "postgresql"
  // Do NOT add url here for Prisma 7
}
```

---

## Running the Application

### Development Mode (Host)
```powershell
# Install dependencies
npm install

# Run in watch mode
npm run start:dev

# Run in production mode
npm run start:prod

# Build the project
npm run build

# Run tests
npm run test

# Run e2e tests
npm run test:e2e
```

### Inside Docker (Automatic)
```powershell
# Docker containers run automatically when started
docker-compose up -d

# View app logs to see it running
docker-compose logs -f app

# App is available at http://localhost:3000
```

---

## Common Errors & Solutions



### Error: Prisma 7 requires adapter configuration
**Solution:** Install adapter packages and configure PrismaService
```powershell
npm install @prisma/adapter-pg pg
```
Then update prisma.service.ts with PrismaPg adapter (see Prisma 7 Adapter Fix section above)



### Error: Prisma Studio shows empty tables despite data existing
**Solution:** Two Postgres instances running (local + Docker)
```powershell
# 1. Stop local PostgreSQL service (Admin PowerShell)
Stop-Service -Name "postgresql-x64-18" -Force

# 2. Disable auto-start (Admin PowerShell)
Set-Service -Name "postgresql-x64-18" -StartupType Disabled

# 3. Run Studio inside container instead
docker-compose exec app npx prisma studio --port 5555 --url="postgresql://postgres:Mohith%402006@postgres:5432/taskdb" --browser none
```

### Error: Port 5432 already in use
**Solution:** Local Postgres is running
```powershell
# Check what's using port 5432
netstat -ano | findstr ":5432"

# Find the process
tasklist /FI "PID eq <PID>"

# Stop local Postgres (Admin PowerShell)
Stop-Service -Name "postgresql-x64-18" -Force
```

### Error: Docker containers won't start
**Solutions:**
```powershell
# Check logs
docker-compose logs

# Restart Docker Desktop
# (Right-click Docker icon in taskbar -> Restart)

# Remove old containers and rebuild
docker-compose down
docker-compose up -d --build

# Nuclear option: remove everything including volumes
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### Error: Data disappeared after rebuild
**Cause:** Used `docker-compose down -v` which removes volumes
**Prevention:**
```powershell
# Always use (preserves data):
docker-compose down

# Never use (deletes data):
docker-compose down -v
```

---

## Generate NestJS Resources

```powershell
# Generate Prisma module and service
nest generate module prisma
nest generate service prisma

# Generate users module with CRUD
nest generate resource users

# Generate projects module with CRUD
nest generate resource projects

# Generate tasks module with CRUD
nest generate resource tasks
```

---

## Database Migrations

### On Host (Development)
```powershell
# Create initial migration
npx prisma migrate dev --name init

# Create migration with custom name
npx prisma migrate dev --name add_user_role_and_task_priority

# Reset database (WARNING: drops all data)
npx prisma migrate reset
```

### In Docker Container
```powershell
# Create migration inside container
docker-compose exec app npx prisma migrate dev --name your_migration_name

# Apply migrations (production)
docker-compose exec app npx prisma migrate deploy

# List migrations in container
docker-compose exec app ls -1 prisma/migrations

# Copy migration from container to host
docker cp task-app:/app/prisma/migrations/MIGRATION_FOLDER_NAME ./prisma/migrations/

# Example:
docker cp task-app:/app/prisma/migrations/20260107064227_add_user_role_and_task_priority ./prisma/migrations/
```

---

## Docker Commands

### Container Management
```powershell
# Build and start containers (first time or after Dockerfile changes)
docker-compose up -d --build

# Start containers (normal startup)
docker-compose up -d

# Stop containers (keeps volumes/data)
docker-compose down

# Stop and remove volumes (WARNING: deletes all data)
docker-compose down -v

# Check container status
docker-compose ps

# Restart specific container
docker-compose restart app
docker-compose restart postgres

# Stop specific container
docker-compose stop app

# Start specific container
docker-compose start app
```

### Logs & Debugging
```powershell
# View logs (all containers)
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific container
docker-compose logs app
docker-compose logs postgres
docker-compose logs -f app

# Execute shell in running container
docker-compose exec app sh
docker exec -it task-app sh

# Execute shell in postgres container
docker exec -it postgres bash
```

### File Operations
```powershell
# Copy file from container to host
docker cp task-app:/app/path/to/file ./local/path/

# Copy file from host to container
docker cp ./local/file.txt task-app:/app/

# List files in container
docker-compose exec app ls -la
docker-compose exec app ls -1 prisma/migrations
```

### Network & Environment
```powershell
# View environment variables in container
docker-compose exec app printenv

# Check network connectivity
docker-compose exec app ping postgres

# Check which process is using a port (host)
netstat -ano | findstr ":5432"
netstat -ano | findstr ":3000"
netstat -ano | findstr ":5555"
```

---

## Prisma Studio

### On Host
```powershell
# Start Prisma Studio on host (default port)
npx prisma studio

# Start Prisma Studio on specific port
npx prisma studio --port 5555

# Start with custom DATABASE_URL (IPv4)
$env:DATABASE_URL='postgresql://postgres:Mohith%402006@127.0.0.1:5432/taskdb'
npx prisma studio --port 5555

# Start with custom DATABASE_URL (localhost)
$env:DATABASE_URL='postgresql://postgres:Mohith%402006@localhost:5432/taskdb'
npx prisma studio --port 5555
```

### In Docker Container
```powershell
# Start Prisma Studio inside container (recommended)
docker-compose exec app npx prisma studio --port 5555 --url="postgresql://postgres:Mohith%402006@postgres:5432/taskdb" --browser none

# Then open http://localhost:5555 in your browser

# Start with browser disabled
docker-compose exec app npx prisma studio --port 5555 --browser none
```

---

## Database Queries

### List Tables
```powershell
# List all tables
docker exec postgres psql -U postgres -d taskdb -c '\dt'

# Describe table structure
docker exec postgres psql -U postgres -d taskdb -c '\d "User"'
docker exec postgres psql -U postgres -d taskdb -c '\d "Project"'
docker exec postgres psql -U postgres -d taskdb -c '\d "Task"'
```

### Query Data
```powershell
# Count records
docker exec postgres psql -U postgres -d taskdb -c 'SELECT COUNT(*) FROM "User";'
docker exec postgres psql -U postgres -d taskdb -c 'SELECT COUNT(*) FROM "Project";'
docker exec postgres psql -U postgres -d taskdb -c 'SELECT COUNT(*) FROM "Task";'

# Query all users
docker exec postgres psql -U postgres -d taskdb -c 'SELECT * FROM "User";'

# Query all projects
docker exec postgres psql -U postgres -d taskdb -c 'SELECT * FROM "Project";'

# Query all tasks
docker exec postgres psql -U postgres -d taskdb -c 'SELECT * FROM "Task";'

# Query with filter
docker exec postgres psql -U postgres -d taskdb -c 'SELECT * FROM "User" WHERE email = '\''mohith.nakka1976@gmail.com'\'';'
```

### Interactive psql Session
```powershell
# Start interactive session
docker exec -it postgres psql -U postgres -d taskdb

# Inside psql:
# \dt              - list tables
# \d "TableName"   - describe table
# \q               - quit
# SELECT * FROM "User";
```

---

## Workflow Scenarios

### Scenario 1: Starting Project After Reboot
```powershell
# 1. Navigate to project
cd C:\Users\N.MOHITH\task-management

# 2. Start Docker containers
docker-compose up -d

# 3. Verify containers are running
docker-compose ps

# 4. Start Prisma Studio (optional)
docker-compose exec app npx prisma studio --port 5555 --url="postgresql://postgres:Mohith%402006@postgres:5432/taskdb" --browser none

# 5. Open http://localhost:5555 in browser
```

### Scenario 2: After Creating Migration in Container
```powershell
# 1. Create migration in container
docker-compose exec app npx prisma migrate dev --name your_migration_name

# 2. List migrations to find the new one
docker-compose exec app ls -1 prisma/migrations

# 3. Copy new migration to host (replace MIGRATION_NAME with actual folder name)
docker cp task-app:/app/prisma/migrations/MIGRATION_FOLDER_NAME ./prisma/migrations/

# 4. Verify it was copied
ls prisma/migrations

# 5. Restart app container (if needed)
docker-compose restart app
```

### Scenario 3: After Changing schema.prisma
```powershell
# Option A: Changes made ON HOST

# 1. Create migration on host
npx prisma migrate dev --name your_change_description

# 2. Rebuild and restart containers
docker-compose up -d --build

# 3. Verify migration was applied
docker-compose exec app npx prisma migrate status


# Option B: Changes made IN CONTAINER

# 1. Edit schema.prisma in container (or rebuild with new schema)
docker-compose up -d --build

# 2. Create migration in container
docker-compose exec app npx prisma migrate dev --name your_change_description

# 3. Copy migration to host
docker cp task-app:/app/prisma/migrations/NEW_MIGRATION_FOLDER ./prisma/migrations/

# 4. Regenerate Prisma Client (if needed)
docker-compose exec app npx prisma generate

# 5. Restart app container
docker-compose restart app
```

### Scenario 4: Testing Endpoints with Postman
```powershell
# 1. Ensure containers are running
docker-compose ps

# 2. Check app logs if endpoint fails
docker-compose logs -f app

# 3. Verify database connection
docker exec postgres psql -U postgres -d taskdb -c '\dt'

# 4. Check data after POST request
docker exec postgres psql -U postgres -d taskdb -c 'SELECT * FROM "User";'

# 5. Refresh Prisma Studio to see new data
# Open http://localhost:5555 and click refresh button
```

### Scenario 5: Rebuilding After Code Changes
```powershell
# 1. Stop containers
docker-compose down

# 2. Rebuild and start (preserves database volume)
docker-compose up -d --build

# 3. Check logs for errors
docker-compose logs -f app

# 4. Verify app is running
docker-compose ps
curl http://localhost:3000
```

---

## Troubleshooting

### Port Conflicts
```powershell
# Check what's using port 5432
netstat -ano | findstr ":5432"

# Find process by PID
tasklist /FI "PID eq <PID>"

# Stop local PostgreSQL service (Admin PowerShell)
Stop-Service -Name "postgresql-x64-18" -Force

# Disable local Postgres from auto-starting (Admin PowerShell)
Set-Service -Name "postgresql-x64-18" -StartupType Disabled

# Alternative: Use sc.exe (Admin PowerShell)
sc.exe stop postgresql-x64-18
```

### Container Issues
```powershell
# View all container logs
docker-compose logs

# Check specific container logs
docker-compose logs app
docker-compose logs postgres

# Restart containers
docker-compose restart

# Rebuild containers from scratch
docker-compose down
docker-compose up -d --build

# Remove all containers and volumes (WARNING: deletes data)
docker-compose down -v
docker-compose up -d --build
```

### Database Connection Issues
```powershell
# Test database connection from app container
docker-compose exec app sh -c 'nc -zv postgres 5432'

# Check DATABASE_URL in container
docker-compose exec app printenv | grep DATABASE_URL

# Verify postgres is accepting connections
docker exec postgres psql -U postgres -c 'SELECT version();'

# Check postgres logs
docker-compose logs postgres
```

### Migration Issues
```powershell
# Check migration status
docker-compose exec app npx prisma migrate status

# Force apply migrations
docker-compose exec app npx prisma migrate deploy

# Reset migrations (WARNING: drops all data)
docker-compose exec app npx prisma migrate reset

# Resolve migration conflicts
docker-compose exec app npx prisma migrate resolve

# View applied migrations in database
docker exec postgres psql -U postgres -d taskdb -c 'SELECT * FROM "_prisma_migrations";'
```

### Prisma Studio Not Showing Data
```powershell
# 1. Verify data exists in database
docker exec postgres psql -U postgres -d taskdb -c 'SELECT COUNT(*) FROM "User";'

# 2. Check which database Studio is connecting to
# Look at the DATABASE_URL when you start Studio

# 3. Stop any running Studio instances
Stop-Process -Name "node" -Force

# 4. Start Studio with explicit DATABASE_URL
$env:DATABASE_URL='postgresql://postgres:Mohith%402006@127.0.0.1:5432/taskdb'
npx prisma studio --port 5555

# 5. Or run Studio inside container (recommended)
docker-compose exec app npx prisma studio --port 5555 --url="postgresql://postgres:Mohith%402006@postgres:5432/taskdb" --browser none
```

---

## Quick Reference

### Daily Development Commands
```powershell
# Start everything
docker-compose up -d

# View app logs
docker-compose logs -f app

# Start Prisma Studio
docker-compose exec app npx prisma studio --port 5555 --url="postgresql://postgres:Mohith%402006@postgres:5432/taskdb" --browser none

# Query database
docker exec postgres psql -U postgres -d taskdb -c 'SELECT * FROM "User";'

# Stop everything
docker-compose down
```

### After Schema Changes
```powershell
# Create migration
npx prisma migrate dev --name your_change_name

# Rebuild containers
docker-compose up -d --build

# Verify
docker-compose logs -f app
```

### Emergency Reset
```powershell
# Stop and remove everything (including data)
docker-compose down -v

# Rebuild from scratch
docker-compose up -d --build

# Apply migrations
docker-compose exec app npx prisma migrate deploy

# Verify
docker-compose ps
docker exec postgres psql -U postgres -d taskdb -c '\dt'
```

---


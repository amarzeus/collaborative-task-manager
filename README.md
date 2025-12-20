# 🧑‍💻 TaskFlow - Collaborative Task Manager

A production-ready, full-stack Task Management application with real-time collaboration features.

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://peaceful-cheesecake-533d96.netlify.app](https://peaceful-cheesecake-533d96.netlify.app) |
| **Backend API** | [https://taskflow-api-bcel.onrender.com](https://taskflow-api-bcel.onrender.com) |

> **Note**: The backend is hosted on Render's free tier, which may take 30-60 seconds to wake up on first request.

## 🌟 Features

- **User Authentication**: Secure JWT-based auth with bcrypt password hashing
- **Full CRUD Operations**: Create, read, update, and delete tasks
- **Real-time Updates**: Live task updates using Socket.io
- **Collaborative**: Assign tasks to team members with instant notifications
- **Dashboard**: Personal views for assigned, created, and overdue tasks
- **Filtering & Sorting**: Filter by status, priority; sort by due date
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Role-Based Access Control**: 5-level role hierarchy (User → Admin)
- **Admin Dashboard**: User management, stats, and system overview
- **Audit Logging**: Track all admin actions for compliance

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React + Vite + TypeScript + Tailwind CSS |
| **State Management** | React Query (TanStack Query) |
| **Forms** | React Hook Form + Zod |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Real-time** | Socket.io |
| **Auth** | JWT + bcrypt |

## 📁 Project Structure

```
collaborative-task-manager/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Route pages
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # API client, socket
│   │   └── types/           # TypeScript types
│   └── package.json
├── backend/                  # Express backend
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Data access
│   │   ├── middleware/      # Auth, validation
│   │   ├── dtos/            # Zod schemas
│   │   ├── routes/          # API routes
│   │   └── socket/          # Socket.io handlers
│   ├── prisma/              # Database schema
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or use Docker)
- npm or yarn

### Using Docker (Recommended)

```bash
# Clone and navigate
cd collaborative-task-manager

# Start all services
docker compose up -d

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Database: PostgreSQL on port 5555
```

### Manual Setup

#### Backend

```bash
cd backend

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📡 API Documentation

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/logout` | Logout user |
| GET | `/api/v1/auth/me` | Get current user |
| PUT | `/api/v1/auth/profile` | Update profile |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tasks` | List tasks (with filters) |
| POST | `/api/v1/tasks` | Create task |
| GET | `/api/v1/tasks/:id` | Get task by ID |
| PUT | `/api/v1/tasks/:id` | Update task |
| DELETE | `/api/v1/tasks/:id` | Delete task |

#### Query Parameters for GET /api/v1/tasks

- `status`: TODO, IN_PROGRESS, REVIEW, COMPLETED
- `priority`: LOW, MEDIUM, HIGH, URGENT
- `assignedToMe`: true/false
- `createdByMe`: true/false
- `overdue`: true/false
- `sortBy`: dueDate, createdAt, priority
- `sortOrder`: asc, desc

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | List all users |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | Get notifications |
| PUT | `/api/v1/notifications/:id/read` | Mark as read |
| PUT | `/api/v1/notifications/read-all` | Mark all read |

### Admin (Requires ADMIN role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/stats` | Dashboard statistics |
| GET | `/api/v1/admin/users` | List all users (paginated) |
| POST | `/api/v1/admin/users` | Create new user |
| PUT | `/api/v1/admin/users/:id` | Update user |
| POST | `/api/v1/admin/users/:id/suspend` | Suspend user |
| POST | `/api/v1/admin/users/:id/activate` | Activate user |
| POST | `/api/v1/admin/tasks/bulk` | Bulk task operations |
| GET | `/api/v1/admin/audit-logs` | View audit logs |

## 🔌 Real-time Events (Socket.io)

### Client Events (Emit)

- `task:subscribe` - Subscribe to task updates
- `task:unsubscribe` - Unsubscribe from updates

### Server Events (Listen)

- `task:created` - When a new task is created
- `task:updated` - When a task is updated
- `task:deleted` - When a task is deleted
- `notification:new` - When assigned to a task

## 🏗️ Architecture Decisions

### Why PostgreSQL?

- Relational data model fits user-task relationships
- Strong ACID compliance for data integrity
- Excellent Prisma ORM support with type safety

### Service Layer Pattern

```
Request → Controller → Service → Repository → Database
                ↓
          Validation (Zod DTOs)
```

- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic, validation
- **Repositories**: Data access abstraction

### JWT in HttpOnly Cookies

- Secure against XSS attacks
- Automatic refresh on requests
- Fallback to Authorization header for API clients

## 🧪 Testing

### Backend Tests (Jest)

```bash
cd backend
npm test
```

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `auth.service.test.ts` | 7 | Register, Login, Profile |
| `task.service.test.ts` | 6 | CRUD, Authorization |
| `validation.test.ts` | 14 | DTO Validation (Zod) |
| **Total** | **27** | ✅ All Passing |

### Frontend Tests (Vitest)

```bash
cd frontend
npm run test:run
```

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `Button.test.tsx` | 6 | Variants, Events, Loading |
| `Input.test.tsx` | 5 | Labels, Errors, Validation |
| `Card.test.tsx` | 4 | Layout Components |
| **Total** | **15** | ✅ All Passing |

### Total Test Coverage: 42 Tests

## 🐳 Docker Configuration

The project includes Docker setup for easy deployment:

- `Dockerfile` for each service
- `docker-compose.yml` for orchestration
- PostgreSQL container with persistent volume

## 🔐 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/task_manager
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

# Admin Configuration (optional)
# Comma-separated emails that auto-get ADMIN role on registration
ADMIN_EMAILS=admin@yourcompany.com,admin@example.com
```

## � Admin Features

### Role-Based Access Control (RBAC)

The app supports a 5-level role hierarchy:

| Role | Level | Capabilities |
|------|-------|-------------|
| USER | 1 | Create/manage own tasks |
| TEAM_LEAD | 2 | + View team tasks |
| MANAGER | 3 | + Assign tasks to team |
| ADMIN | 4 | + User management, bulk ops |
| SUPER_ADMIN | 5 | + System configuration |

### Making a User Admin

Three ways to create admin users:

1. **Quick Invite** (Easiest): Use the "Invite Admin" button in Admin Dashboard
2. **Auto-detect**: Add email to `ADMIN_EMAILS` in `.env` before registration
3. **Prisma Studio**: Manually update user's role in database

## �📝 Trade-offs & Assumptions

1. **Single database**: For simplicity, not using read replicas
2. **In-memory sessions**: JWT stateless, no server-side session storage
3. **Basic notifications**: In-app only, no email/push notifications
4. **Task ownership**: Only creators can delete tasks
5. **No pagination**: Task list returns all matching tasks (suitable for small teams)

## 🎯 Bonus Features Implemented

- [x] **Optimistic UI**: Task updates appear instantly before server confirmation
- [x] **Dockerization**: Full Docker Compose setup included
- [x] **Audit Logging**: Complete audit trail for admin actions
- [x] **RBAC**: Role-based access control with 5-level hierarchy
- [x] **Admin Dashboard**: User management, stats, bulk operations

## 📄 License

MIT License - feel free to use for any purpose.

# SchoolIQ - Separated Frontend/Backend Architecture

**Version:** 3.0  
**Date:** February 14, 2026  
**Architecture Type:** Decoupled Frontend + Backend API  
**Status:** Design Document

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture](#backend-architecture)
5. [Communication Patterns](#communication-patterns)
6. [Authentication & Authorization](#authentication--authorization)
7. [Data Flow Examples](#data-flow-examples)
8. [Deployment Strategy](#deployment-strategy)
9. [Trade-offs Analysis](#trade-offs-analysis)
10. [Migration Path](#migration-path)

---

## 📊 Executive Summary

### Current Architecture (Next.js Full-Stack)
```
┌─────────────────────────────────────────┐
│         Next.js Application             │
│  ┌────────────┐      ┌──────────────┐   │
│  │  Frontend  │──────│  Server      │   │
│  │ (React)    │      │  Actions     │   │
│  └────────────┘      └──────┬───────┘   │
│                             │           │
│                      ┌──────▼───────┐   │
│                      │   Supabase   │   │
│                      └──────────────┘   │
└─────────────────────────────────────────┘
     Single Deployment (Vercel)
```

### Proposed Separated Architecture
```
┌──────────────────────┐         ┌──────────────────────┐
│   Frontend (SPA)     │         │   Backend API        │
│                      │         │                      │
│  ┌────────────────┐  │         │  ┌────────────────┐  │
│  │     React      │  │◄───────►│  │   REST API     │  │
│  │   Next.js      │  │  HTTPS  │  │   (Node.js)    │  │
│  │   (Static)     │  │  JSON   │  │                │  │
│  └────────────────┘  │         │  └────────┬───────┘  │
│                      │         │           │          │
│  State Management    │         │  ┌────────▼───────┐  │
│  ├─ React Query      │         │  │    Modules     │  │
│  ├─ Zustand          │         │  │  (Business     │  │
│  └─ Context API      │         │  │   Logic)       │  │
└──────────────────────┘         │  └────────┬───────┘  │
                                 │           │          │
    Deploy: Vercel/Netlify       │  ┌────────▼───────┐  │
    CDN: Cloudflare              │  │   PostgreSQL   │  │
                                 │  │   (Supabase)   │  │
                                 │  └────────────────┘  │
                                 └──────────────────────┘
                                     Deploy: Railway/Fly.io
                                     Container: Docker
```

### Why Separate Frontend/Backend?

#### ✅ Benefits
1. **Independent Scaling** - Scale frontend CDN and backend API separately
2. **Technology Flexibility** - Change frontend framework without touching backend
3. **Mobile Apps** - Same API for web + iOS + Android
4. **Team Independence** - Frontend and backend teams work separately
5. **Better Caching** - Static frontend on CDN, dynamic API calls
6. **Multi-Platform** - Same backend for web, mobile, desktop apps

#### ❌ Trade-offs
1. **More Complexity** - Need to manage CORS, authentication tokens
2. **No Server-Side Rendering** - Lose Next.js SSR benefits
3. **More Network Calls** - Every data fetch is a network request
4. **CORS Issues** - Must handle cross-origin requests
5. **Deployment Complexity** - Two separate deployments vs one
6. **Authentication Complexity** - Token management, refresh logic

---

## 🏗️ Architecture Overview

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                            │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web App    │  │  iOS App     │  │ Android App  │          │
│  │  (React)     │  │  (Swift)     │  │  (Kotlin)    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
└─────────┼─────────────────┼─────────────────┼───────────────────┘
          │                 │                 │
          └─────────────────┴─────────────────┘
                            │
                   HTTPS + JSON/JWT
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  API Gateway (Kong / AWS API Gateway / Custom)             │  │
│  │  ├─ Rate Limiting                                           │  │
│  │  ├─ Authentication (JWT Validation)                         │  │
│  │  ├─ Request Logging                                         │  │
│  │  └─ Route to Backend Modules                                │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      BACKEND API LAYER                           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Students   │  │  Attendance  │  │    Exams     │          │
│  │   Module     │  │   Module     │  │   Module     │          │
│  │              │  │              │  │              │          │
│  │  /api/v1/    │  │  /api/v1/    │  │  /api/v1/    │          │
│  │  students    │  │  attendance  │  │  exams       │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └─────────────────┴─────────────────┘                   │
│                            │                                     │
│  ┌─────────────────────────▼──────────────────────────────┐     │
│  │              Event Bus (RabbitMQ / Redis)              │     │
│  │        Cross-module communication via events            │     │
│  └────────────────────────────────────────────────────────┘     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                       DATA LAYER                                 │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │   PostgreSQL   │  │     Redis      │  │      S3        │    │
│  │   (Primary)    │  │    (Cache)     │  │  (File Store)  │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Architecture

### Technology Stack

```typescript
Frontend Stack:
├── Framework: React 18 + Next.js 15 (Static Export)
├── Routing: Next.js App Router
├── State Management:
│   ├── Server State: TanStack Query (React Query)
│   ├── Client State: Zustand
│   └── Form State: React Hook Form + Zod
├── Styling: Tailwind CSS + Shadcn UI
├── API Client: Axios + OpenAPI TypeScript Generator
├── Authentication: JWT + Refresh Token
└── Real-time: Socket.io Client / Server-Sent Events
```

### Folder Structure

```
frontend/
├── public/                              # Static assets
├── src/
│   ├── app/                             # Next.js app router
│   │   ├── (auth)/                      # Auth routes
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/                 # Protected routes
│   │   │   ├── school-admin/
│   │   │   ├── teacher/
│   │   │   ├── student/
│   │   │   └── parent/
│   │   └── layout.tsx
│   │
│   ├── features/                        # Feature-based modules
│   │   ├── students/
│   │   │   ├── api/                     # API calls for students
│   │   │   │   ├── useStudents.ts       # React Query hook
│   │   │   │   ├── useCreateStudent.ts
│   │   │   │   └── studentsApi.ts       # API client
│   │   │   ├── components/              # Student-specific components
│   │   │   │   ├── StudentList.tsx
│   │   │   │   ├── StudentForm.tsx
│   │   │   │   └── StudentCard.tsx
│   │   │   ├── types/                   # TypeScript types
│   │   │   │   └── student.types.ts
│   │   │   └── store/                   # Zustand store (if needed)
│   │   │       └── studentStore.ts
│   │   │
│   │   ├── attendance/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   ├── types/
│   │   │   └── store/
│   │   │
│   │   ├── exams/
│   │   ├── assignments/
│   │   └── analytics/
│   │
│   ├── shared/                          # Shared utilities
│   │   ├── components/                  # Reusable UI components
│   │   │   ├── ui/                      # Shadcn components
│   │   │   ├── DataTable/
│   │   │   ├── FormFields/
│   │   │   └── Layout/
│   │   ├── hooks/                       # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── usePermissions.ts
│   │   │   └── useToast.ts
│   │   ├── lib/                         # Utilities
│   │   │   ├── api-client.ts            # Axios instance
│   │   │   ├── auth.ts                  # Auth helpers
│   │   │   └── utils.ts
│   │   └── types/                       # Global types
│   │       └── api.types.ts
│   │
│   ├── store/                           # Global state
│   │   ├── authStore.ts                 # Auth state (Zustand)
│   │   └── uiStore.ts                   # UI state
│   │
│   └── config/                          # Configuration
│       ├── api.config.ts                # API endpoints
│       └── app.config.ts                # App settings
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js                       # Static export config
```

### API Client Implementation

```typescript
// src/shared/lib/api-client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { authStore } from '@/store/authStore';

class ApiClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = authStore.getState().accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;

        // If 401 and not already retrying, refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Prevent multiple simultaneous refresh requests
            if (!this.refreshTokenPromise) {
              this.refreshTokenPromise = this.refreshAccessToken();
            }

            const newToken = await this.refreshTokenPromise;
            this.refreshTokenPromise = null;

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            authStore.getState().logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = authStore.getState().refreshToken;
    
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      { refresh_token: refreshToken }
    );

    const { access_token } = response.data;
    authStore.getState().setAccessToken(access_token);
    
    return access_token;
  }

  // Public methods
  get<T>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }

  post<T>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  put<T>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  delete<T>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }

  patch<T>(url: string, data?: any, config?: any) {
    return this.client.patch<T>(url, data, config);
  }
}

export const apiClient = new ApiClient();
```

### React Query Integration

```typescript
// src/features/students/api/useStudents.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import { Student, CreateStudentDto } from '../types/student.types';

// Query keys
export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (filters: string) => [...studentKeys.lists(), { filters }] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
};

// Get all students
export function useStudents(filters?: {
  schoolId?: string;
  classId?: string;
  status?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: studentKeys.list(JSON.stringify(filters)),
    queryFn: async () => {
      const { data } = await apiClient.get<{
        students: Student[];
        total: number;
        page: number;
        pageSize: number;
      }>('/students', { params: filters });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Get single student
export function useStudent(id: string) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Student>(`/students/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Create student mutation
export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStudentDto) => {
      const response = await apiClient.post<Student>('/students', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch students list
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
    onError: (error: any) => {
      console.error('Failed to create student:', error);
    },
  });
}

// Update student mutation
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Student> }) => {
      const response = await apiClient.put<Student>(`/students/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(studentKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: studentKeys.lists() });
    },
  });
}
```

### Component Example

```typescript
// src/features/students/components/StudentList.tsx
'use client';

import { useState } from 'react';
import { useStudents, useCreateStudent } from '../api/useStudents';
import { Button } from '@/shared/components/ui/button';
import { StudentForm } from './StudentForm';

export function StudentList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useStudents({ page });
  const createStudent = useCreateStudent();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Students ({data?.total})</h2>
      
      <div className="grid gap-4">
        {data?.students.map((student) => (
          <div key={student.id} className="border p-4 rounded">
            <h3>{student.first_name} {student.last_name}</h3>
            <p>Roll No: {student.roll_number}</p>
          </div>
        ))}
      </div>

      <Button
        onClick={() => {
          createStudent.mutate({
            first_name: 'John',
            last_name: 'Doe',
            // ... other fields
          });
        }}
        disabled={createStudent.isPending}
      >
        {createStudent.isPending ? 'Creating...' : 'Add Student'}
      </Button>
    </div>
  );
}
```

---

## 🔧 Backend Architecture

### Technology Stack

```typescript
Backend Stack:
├── Runtime: Node.js 20 + TypeScript
├── Framework: Express.js or Fastify
├── ORM: Prisma or Drizzle
├── Validation: Zod
├── Authentication: JWT (jsonwebtoken)
├── Authorization: CASL (permissions)
├── Event Bus: BullMQ (Redis-based)
├── File Upload: Multer + AWS S3
├── Email: Nodemailer / SendGrid
├── PDF Generation: Puppeteer / PDF-lib
├── Logging: Winston + Morgan
├── Testing: Jest + Supertest
└── API Documentation: OpenAPI (Swagger)
```

### Folder Structure

```
backend/
├── src/
│   ├── modules/                         # Domain modules
│   │   ├── students/
│   │   │   ├── domain/                  # Business entities
│   │   │   │   └── student.entity.ts
│   │   │   ├── services/                # Business logic
│   │   │   │   └── student.service.ts
│   │   │   ├── controllers/             # HTTP handlers
│   │   │   │   └── student.controller.ts
│   │   │   ├── repository/              # Data access
│   │   │   │   └── student.repository.ts
│   │   │   ├── dto/                     # Data transfer objects
│   │   │   │   ├── create-student.dto.ts
│   │   │   │   └── update-student.dto.ts
│   │   │   ├── validators/              # Input validation
│   │   │   │   └── student.validator.ts
│   │   │   ├── events/                  # Domain events
│   │   │   │   ├── student-enrolled.event.ts
│   │   │   │   └── handlers/
│   │   │   ├── routes/                  # Express routes
│   │   │   │   └── student.routes.ts
│   │   │   └── index.ts                 # Module entry
│   │   │
│   │   ├── attendance/
│   │   ├── exams/
│   │   ├── assignments/
│   │   ├── teachers/
│   │   └── auth/
│   │
│   ├── shared/                          # Shared infrastructure
│   │   ├── database/
│   │   │   ├── prisma.client.ts
│   │   │   └── migrations/
│   │   ├── events/
│   │   │   ├── event-bus.ts
│   │   │   └── event.interface.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   └── rate-limit.middleware.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── email.ts
│   │   │   └── file-upload.ts
│   │   ├── errors/
│   │   │   ├── app-error.ts
│   │   │   └── error-codes.ts
│   │   ├── types/
│   │   │   └── express.d.ts
│   │   └── config/
│   │       ├── env.config.ts
│   │       └── database.config.ts
│   │
│   ├── api/                             # API layer
│   │   ├── v1/
│   │   │   ├── index.ts                 # Route aggregator
│   │   │   └── openapi.yaml             # API documentation
│   │   └── index.ts
│   │
│   ├── app.ts                           # Express app setup
│   └── server.ts                        # Server entry point
│
├── tests/                               # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── package.json
├── tsconfig.json
└── .env.example
```

### REST API Structure

```typescript
API Endpoints:

/api/v1
├── /auth
│   ├── POST   /register              # Register new user
│   ├── POST   /login                 # Login
│   ├── POST   /logout                # Logout
│   ├── POST   /refresh               # Refresh access token
│   └── GET    /me                    # Get current user
│
├── /students
│   ├── GET    /                      # List students (paginated, filtered)
│   ├── POST   /                      # Create student
│   ├── GET    /:id                   # Get student details
│   ├── PUT    /:id                   # Update student
│   ├── DELETE /:id                   # Delete student
│   ├── POST   /:id/enroll            # Enroll in section
│   ├── GET    /:id/attendance        # Get attendance records
│   └── GET    /:id/assignments       # Get assignments
│
├── /attendance
│   ├── GET    /sessions              # List sessions
│   ├── POST   /sessions              # Create session
│   ├── GET    /sessions/:id          # Get session
│   ├── POST   /sessions/:id/mark     # Mark attendance
│   ├── PUT    /sessions/:id/lock     # Lock session
│   └── GET    /reports               # Attendance reports
│
├── /assignments
│   ├── GET    /                      # List assignments
│   ├── POST   /                      # Create assignment
│   ├── GET    /:id                   # Get assignment
│   ├── PUT    /:id                   # Update assignment
│   ├── POST   /:id/submit            # Submit assignment
│   ├── POST   /:id/grade             # Grade submission
│   └── GET    /:id/submissions       # List submissions
│
├── /exams
│   ├── GET    /                      # List exams
│   ├── POST   /                      # Create exam
│   ├── GET    /:id                   # Get exam
│   ├── POST   /:id/marks             # Enter marks
│   ├── GET    /:id/results           # Get results
│   └── POST   /:id/publish           # Publish results
│
├── /teachers
│   ├── GET    /                      # List teachers
│   ├── POST   /                      # Create teacher
│   ├── GET    /:id                   # Get teacher
│   ├── PUT    /:id                   # Update teacher
│   └── POST   /:id/leave             # Apply leave
│
├── /classes
│   ├── GET    /                      # List classes
│   ├── POST   /                      # Create class
│   ├── GET    /:id                   # Get class
│   ├── GET    /:id/students          # Get students in class
│   └── GET    /:id/timetable         # Get timetable
│
├── /analytics
│   ├── GET    /dashboard             # Dashboard data
│   ├── GET    /attendance-trends     # Attendance analytics
│   └── GET    /performance           # Performance metrics
│
└── /notifications
    ├── GET    /                      # List notifications
    ├── POST   /read/:id              # Mark as read
    └── WS     /stream                # Real-time notifications
```

### Controller Implementation

```typescript
// src/modules/students/controllers/student.controller.ts
import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';
import { CreateStudentDto, UpdateStudentDto } from '../dto';
import { studentValidator } from '../validators/student.validator';

export class StudentController {
  /**
   * GET /api/v1/students
   * List all students with filters and pagination
   */
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.user!; // From auth middleware
      const filters = {
        schoolId,
        classId: req.query.classId as string,
        sectionId: req.query.sectionId as string,
        status: req.query.status as string,
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 50,
      };

      const result = await StudentService.getStudents(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/students/:id
   * Get single student by ID
   */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { schoolId } = req.user!;

      const student = await StudentService.getStudentById(id, schoolId);

      if (!student) {
        return res.status(404).json({
          success: false,
          error: 'Student not found',
        });
      }

      res.json({
        success: true,
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/students
   * Create new student
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate input
      const validatedData = studentValidator.create.parse(req.body);
      
      const { schoolId, userId } = req.user!;

      const student = await StudentService.createStudent({
        ...validatedData,
        schoolId,
        createdBy: userId,
      });

      res.status(201).json({
        success: true,
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/students/:id
   * Update student
   */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = studentValidator.update.parse(req.body);
      
      const { schoolId, userId } = req.user!;

      const student = await StudentService.updateStudent(
        id,
        schoolId,
        validatedData,
        userId
      );

      res.json({
        success: true,
        data: student,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/students/:id
   * Delete student
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { schoolId } = req.user!;

      await StudentService.deleteStudent(id, schoolId);

      res.json({
        success: true,
        message: 'Student deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
```

### Service Layer Implementation

```typescript
// src/modules/students/services/student.service.ts
import { StudentRepository } from '../repository/student.repository';
import { EventBus } from '@/shared/events/event-bus';
import { StudentEnrolledEvent } from '../events/student-enrolled.event';
import { CreateStudentDto, UpdateStudentDto } from '../dto';
import { AppError } from '@/shared/errors/app-error';

export class StudentService {
  /**
   * Get all students with filters
   */
  static async getStudents(filters: any) {
    return await StudentRepository.findMany(filters);
  }

  /**
   * Get student by ID
   */
  static async getStudentById(id: string, schoolId: string) {
    const student = await StudentRepository.findById(id);

    // Security: Verify student belongs to school
    if (student && student.school_id !== schoolId) {
      throw new AppError('Student not found', 404);
    }

    return student;
  }

  /**
   * Create new student
   */
  static async createStudent(data: CreateStudentDto & { 
    schoolId: string; 
    createdBy: string;
  }) {
    // Business logic validation
    const existingStudent = await StudentRepository.findByEmail(data.email);
    if (existingStudent) {
      throw new AppError('Student with this email already exists', 400);
    }

    // Create student
    const student = await StudentRepository.create({
      ...data,
      school_id: data.schoolId,
      status: 'active',
    });

    // Create guardian if provided
    if (data.guardian) {
      await StudentRepository.createGuardian(student.id, data.guardian);
    }

    // Emit domain event
    await EventBus.emit(new StudentEnrolledEvent({
      studentId: student.id,
      schoolId: data.schoolId,
      createdBy: data.createdBy,
    }));

    return student;
  }

  /**
   * Update student
   */
  static async updateStudent(
    id: string,
    schoolId: string,
    data: UpdateStudentDto,
    updatedBy: string
  ) {
    // Verify student exists and belongs to school
    const existing = await this.getStudentById(id, schoolId);
    if (!existing) {
      throw new AppError('Student not found', 404);
    }

    // Update
    return await StudentRepository.update(id, data);
  }

  /**
   * Delete student
   */
  static async deleteStudent(id: string, schoolId: string) {
    const student = await this.getStudentById(id, schoolId);
    if (!student) {
      throw new AppError('Student not found', 404);
    }

    // Soft delete
    return await StudentRepository.softDelete(id);
  }
}
```

### Repository Implementation

```typescript
// src/modules/students/repository/student.repository.ts
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/shared/database/prisma.client';

export class StudentRepository {
  /**
   * Find many students with filters
   */
  static async findMany(filters: {
    schoolId: string;
    classId?: string;
    sectionId?: string;
    status?: string;
    page: number;
    pageSize: number;
  }) {
    const skip = (filters.page - 1) * filters.pageSize;

    const where: any = {
      school_id: filters.schoolId,
      status: filters.status || 'active',
    };

    if (filters.classId) {
      where.enrollments = {
        some: {
          section: {
            class_id: filters.classId,
          },
        },
      };
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: filters.pageSize,
        include: {
          student_guardians: {
            include: {
              guardian: true,
            },
          },
          enrollments: {
            include: {
              section: {
                include: {
                  class: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      students,
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: Math.ceil(total / filters.pageSize),
    };
  }

  /**
   * Find student by ID
   */
  static async findById(id: string) {
    return await prisma.student.findUnique({
      where: { id },
      include: {
        student_guardians: {
          include: {
            guardian: true,
          },
        },
        enrollments: {
          include: {
            section: {
              include: {
                class: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Find student by email
   */
  static async findByEmail(email: string) {
    return await prisma.student.findFirst({
      where: { email },
    });
  }

  /**
   * Create student
   */
  static async create(data: any) {
    return await prisma.student.create({
      data,
    });
  }

  /**
   * Update student
   */
  static async update(id: string, data: any) {
    return await prisma.student.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft delete student
   */
  static async softDelete(id: string) {
    return await prisma.student.update({
      where: { id },
      data: {
        status: 'withdrawn',
        deleted_at: new Date(),
      },
    });
  }

  /**
   * Create guardian
   */
  static async createGuardian(studentId: string, guardianData: any) {
    return await prisma.guardian.create({
      data: {
        ...guardianData,
        student_guardians: {
          create: {
            student_id: studentId,
            relationship: guardianData.relationship,
            is_primary: true,
          },
        },
      },
    });
  }
}
```

### Routes Definition

```typescript
// src/modules/students/routes/student.routes.ts
import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authMiddleware } from '@/shared/middleware/auth.middleware';
import { permissionMiddleware } from '@/shared/middleware/permission.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// List students
router.get(
  '/',
  permissionMiddleware('students:view'),
  StudentController.list
);

// Get single student
router.get(
  '/:id',
  permissionMiddleware('students:view'),
  StudentController.getById
);

// Create student
router.post(
  '/',
  permissionMiddleware('students:create'),
  StudentController.create
);

// Update student
router.put(
  '/:id',
  permissionMiddleware('students:update'),
  StudentController.update
);

// Delete student
router.delete(
  '/:id',
  permissionMiddleware('students:delete'),
  StudentController.delete
);

export default router;
```

---

## 🔐 Authentication & Authorization

### JWT Token Flow

```typescript
Authentication Flow:

1. Login Request
   Frontend → POST /api/v1/auth/login
   Body: { email, password }
   
2. Backend Validates Credentials
   - Check email/password
   - Generate access token (15 min expiry)
   - Generate refresh token (7 days expiry)
   - Store refresh token in database
   
3. Response
   {
     "access_token": "eyJhbGc...",
     "refresh_token": "eyJhbGc...",
     "expires_in": 900,
     "user": { id, email, role, school_id }
   }
   
4. Frontend Stores Tokens
   - Access token: Memory (React state)
   - Refresh token: HttpOnly cookie or localStorage
   
5. Authenticated Requests
   Frontend → GET /api/v1/students
   Headers: { Authorization: "Bearer eyJhbGc..." }
   
6. Token Expiry
   - Access token expires → 401 Unauthorized
   - Frontend automatically calls /auth/refresh
   - Backend validates refresh token
   - Issues new access token
   - Retry original request
   
7. Refresh Token Expiry
   - Refresh token expires → Logout user
   - Redirect to login page
```

### Auth Implementation

```typescript
// Backend: src/modules/auth/services/auth.service.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '@/shared/database/prisma.client';
import { AppError } from '@/shared/errors/app-error';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export class AuthService {
  /**
   * Login user
   */
  static async login(email: string, password: string) {
    // Find user
    const user = await prisma.profile.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user_id: user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900, // 15 minutes in seconds
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
        school_id: user.school_id,
        full_name: user.full_name,
      },
    };
  }

  /**
   * Refresh access token
   */
  static async refresh(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as any;

      // Check if token exists in database
      const storedToken = await prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          user_id: payload.userId,
          revoked: false,
          expires_at: {
            gt: new Date(),
          },
        },
      });

      if (!storedToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Get user
      const user = await prisma.profile.findUnique({
        where: { id: payload.userId },
        include: { role: true },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user);

      return {
        access_token: accessToken,
        expires_in: 900,
      };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  /**
   * Logout user
   */
  static async logout(refreshToken: string) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revoked: true },
    });
  }

  /**
   * Generate access token (short-lived)
   */
  private static generateAccessToken(user: any): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role.name,
        schoolId: user.school_id,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  }

  /**
   * Generate refresh token (long-lived)
   */
  private static generateRefreshToken(user: any): string {
    return jwt.sign(
      {
        userId: user.id,
      },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
  }
}
```

### Auth Middleware

```typescript
// Backend: src/shared/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '@/shared/errors/app-error';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET!;

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        schoolId: string;
      };
    }
  }
}

/**
 * Verify JWT token and attach user to request
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as any;

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      schoolId: decoded.schoolId,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    next(error);
  }
}
```

### Frontend Auth Store

```typescript
// Frontend: src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: string;
  school_id: string;
  full_name: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const authStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken });
      },

      setAccessToken: (accessToken) => {
        set({ accessToken });
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null });
      },

      isAuthenticated: () => {
        return !!get().accessToken && !!get().user;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist user and refresh token, not access token
        user: state.user,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
```

---

## 📡 Communication Patterns

### Option 1: REST API (Recommended for MVP)

**Pros:**
- ✅ Simple and well-understood
- ✅ Easy to cache
- ✅ Good IDE support
- ✅ Works with any frontend

**Cons:**
- ❌ Over-fetching/under-fetching data
- ❌ Multiple requests for related data
- ❌ N+1 query problems

### Option 2: GraphQL

**Pros:**
- ✅ Fetch exactly what you need
- ✅ Single request for nested data
- ✅ Strong typing
- ✅ Real-time subscriptions

**Cons:**
- ❌ More complex setup
- ❌ Harder to cache
- ❌ Steep learning curve

**Recommendation for SchoolIQ**: Start with REST, migrate to GraphQL if needed.

---

### Real-time Communication

For notifications, attendance updates, etc.:

```typescript
// Option 1: Server-Sent Events (SSE)
// Backend
app.get('/api/v1/notifications/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Subscribe to events
  EventBus.on('notification', sendEvent);

  req.on('close', () => {
    EventBus.off('notification', sendEvent);
  });
});

// Frontend
const eventSource = new EventSource('/api/v1/notifications/stream');
eventSource.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  // Show notification to user
};

// Option 2: WebSockets (Socket.io)
// Backend
import { Server } from 'socket.io';

const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL },
});

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify JWT token
  next();
});

io.on('connection', (socket) => {
  const userId = socket.data.userId;
  
  socket.join(`user:${userId}`);
  
  // Listen to events and broadcast
  EventBus.on('notification', (notification) => {
    if (notification.userId === userId) {
      socket.emit('notification', notification);
    }
  });
});

// Frontend
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_API_URL, {
  auth: { token: authStore.getState().accessToken },
});

socket.on('notification', (notification) => {
  // Show notification
});
```

---

## 🚀 Deployment Strategy

### Frontend Deployment

```yaml
# Vercel/Netlify Configuration
name: Deploy Frontend
on:
  push:
    branches: [main]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: cd frontend && npm install
      
      - name: Build
        run: cd frontend && npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
      
      - name: Deploy to Vercel
        run: vercel --prod
```

**Frontend Hosting Options:**
- ✅ Vercel (best for Next.js)
- ✅ Netlify
- ✅ Cloudflare Pages
- ✅ AWS S3 + CloudFront

### Backend Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 4000

CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/schooliq
      REDIS_URL: redis://redis:6379
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: schooliq
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

**Backend Hosting Options:**
- ✅ Railway.app (easiest, affordable)
- ✅ Fly.io (good for global deployment)
- ✅ AWS ECS/Fargate (enterprise)
- ✅ DigitalOcean App Platform

---

## ⚖️ Trade-offs Analysis

### REST API vs Next.js Full-Stack

| Aspect | Next.js Full-Stack | Separated REST API | Winner |
|--------|-------------------|-------------------|---------|
| **Development Speed** | Fast (no API layer) | Slower (build API + frontend) | Next.js ✅ |
| **Mobile Apps** | Need separate backend | Same API for all | REST ✅ |
| **SEO** | Excellent (SSR) | Poor (SPA) | Next.js ✅ |
| **Caching** | Complex | Simple (CDN + API cache) | REST ✅ |
| **Type Safety** | Excellent (shared types) | Need code generation | Next.js ✅ |
| **Team Separation** | Hard (monorepo) | Easy (separate repos) | REST ✅ |
| **Scaling** | Scale together | Scale independently | REST ✅ |
| **Real-time** | Complex (Server Actions) | Easy (WebSockets) | REST ✅ |
| **Cost** | $20/month (Vercel) | $40/month (Vercel + Railway) | Next.js ✅ |
| **Deploy Complexity** | Single deploy | Two deploys | Next.js ✅ |

### Recommendation Matrix

**Choose Next.js Full-Stack if:**
- ✅ Web-only application (no mobile apps)
- ✅ Small team (1-3 developers)
- ✅ Need fast development
- ✅ SEO is critical
- ✅ Budget-conscious

**Choose Separated Architecture if:**
- ✅ Building mobile apps (iOS/Android)
- ✅ Large team (frontend + backend)
- ✅ Need independent scaling
- ✅ Multiple client applications
- ✅ Future microservices plan

---

## 🛣️ Migration Path

### Phase 1: Hybrid Approach (Recommended Start)

Keep Next.js full-stack but prepare for separation:

```typescript
// Create API-like structure in Next.js
app/
├── api/
│   └── v1/                    # REST-like API routes
│       ├── students/          # Can become real API later
│       ├── attendance/
│       └── exams/
│
└── (dashboard)/               # Frontend pages
    ├── school-admin/
    └── teacher/
```

**Benefits:**
- ✅ Fast development now
- ✅ Easy to extract API later
- ✅ Test REST API structure
- ✅ One deployment

### Phase 2: Extract Backend (When Needed)

1. **Create separate backend repository**
2. **Copy API routes → Express/Fastify**
3. **Add authentication layer**
4. **Deploy backend independently**
5. **Convert Next.js to static export**
6. **Update frontend to call external API**

Migration effort: **2-4 weeks** for experienced team.

---

## 🎯 Final Recommendation for SchoolIQ

### Start with Next.js Full-Stack (Current)

**Why:**
- You're building MVP fast
- Web-first application
- Small team
- No mobile apps yet
- SEO matters (marketing pages)

### Migrate to Separated when:

1. **Mobile apps are priority** - Need iOS/Android apps
2. **Team grows** - Separate frontend/backend teams
3. **Performance issues** - Need independent scaling
4. **Microservices planned** - Preparing for service extraction

### Hybrid Approach (Best of Both Worlds)

```
Current: Next.js Monolith
   ↓
Step 1: Structure code like separated (modules, clear APIs)
   ↓
Step 2: Build mobile apps → Extract API only for mobile
   ↓
Step 3: Web still uses Next.js Server Actions
   ↓
Step 4: Gradually migrate web to use same API
   ↓
Future: Fully separated (optional)
```

---

**Bottom Line:** Your current Next.js architecture is **perfect for MVP**. The separated architecture is **future-proof** but adds complexity you don't need yet. Focus on **modular code structure** now, which makes migration easy later if needed.

Want me to:
1. Create the backend API starter template?
2. Show how to structure Next.js for easy extraction?
3. Build the mobile app API specification?

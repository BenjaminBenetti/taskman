# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Development Commands

```bash
# Start the backend and database services
docker-compose up --build

# Start CLI client in development mode
deno task cli:dev

# Start CLI client normally
deno task cli
```

## Architecture Overview

TaskMan is a keyboard-driven task management system with AI capabilities using a
client-server architecture:

- **Backend** (`/backend`): TRPC API server with Prisma ORM, handles data
  persistence and AI tasks
- **CLI** (`/cli`): React-based TUI client using Ink, connects to backend via
  TRPC
- **Database**: PostgreSQL for persistent storage (via Docker)

## Key Technologies

- **Runtime**: Deno 2.4.2 (both backend and CLI)
- **Backend**: TRPC, Prisma ORM, PostgreSQL, Jose (JWT)
- **CLI**: React 18.x, Ink TUI library
- **Database**: PostgreSQL 17 (Docker container)

## Project Structure

```
/backend          # TRPC API server
 src/
    auth/     # Authentication (Google OAuth)
    config/   # Configuration management
    trpc/     # TRPC routers and middleware
    prisma/   # Database connection
 prisma/       # Database schema and migrations

/cli              # Terminal UI client
 src/
    auth/     # Client-side auth services
    config/   # Client configuration
    trpc/     # TRPC client factory
    ui/       # React components for TUI
```

## Authentication System

The system uses Google OAuth with JWT tokens:

- Backend handles token exchange and refresh
- CLI manages auth sessions locally
- Multi-tenant support with tenant isolation

## Database

Uses Prisma ORM with PostgreSQL:

- Migrations in `/backend/prisma/migrations/`
- Schema defined in `/backend/prisma/schema.prisma`
- Generated client in `/backend/src/generated/prisma/`

## Development Environment

The project is designed to run in a DevContainer with Docker Compose managing
the PostgreSQL database and backend services.

## Backend Application Layers

- **Router Layer (Controllers)**: TRPC routers handle HTTP requests, call services, return domain models
- **Service Layer**: Uses converters to transform Prisma entities to domain models, handles business logic
- **Repository Layer**: Works with Prisma entities, handles data persistence
- **Converters**: Bidirectional transformation between domain models and Prisma entities

## TypeScript Validation Philosophy

Avoid creating runtime validation utilities for basic type checking (like validating if something is an array or checking for null/undefined). TypeScript's type system provides compile-time safety that makes such runtime validation redundant and adds unnecessary complexity. Trust TypeScript's type system - if a method parameter is typed as `T[]`, it will be an array at runtime. Focus validation efforts on business logic validation rather than type validation that TypeScript already handles.

# Error Handling Principles

## Critical Anti-Pattern: Error Suppression

**NEVER use error suppression with empty catch blocks or catch blocks that only log and continue.**

### Examples of what NOT to do:
```typescript
try {
  // some operation
} catch (_) {
  // Silent suppression - BAD
}

try {
  // some operation  
} catch (error) {
  console.warn('Something failed:', error);
  // Continue as if nothing happened - BAD unless explicitly justified
}
```

### Why this is harmful:
- Hides important issues and makes debugging extremely difficult
- Can mask critical failures that should be handled properly
- Makes it impossible to understand why things are failing in production
- Can lead to inconsistent application state

### Better approaches:
- Handle errors appropriately with proper error handling logic
- If an error truly needs to be handled silently, there should be a clear business reason and comprehensive logging
- Most cases just throw the error up the stack.

This principle applies to ALL code I work with - I should identify and fix error suppression patterns rather than perpetuate them.
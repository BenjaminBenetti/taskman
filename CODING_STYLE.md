
# Coding Style 

## Core Principles

### SOLID Principles

#### Single Responsibility Principle (SRP)
- Each class/module should have ONE reason to change
- Keep classes focused on a single concern
- If a class description contains "and", it likely violates SRP

**Good Example:**
```typescript
// Each class has a single, clear responsibility
class TaskRepository {
    save(task: Task): Promise<void> { }
    findById(id: string): Promise<Task> { }
}

class TaskValidator {
    validate(task: Task): ValidationResult { }
}

class TaskNotificationService {
    notify(task: Task, event: TaskEvent): Promise<void> { }
}
```

**Bad Example:**
```typescript
// This class has multiple responsibilities
class TaskService {
    save(task: Task): Promise<void> { }
    validate(task: Task): boolean { }
    sendEmail(task: Task): void { }
    generateReport(tasks: Task[]): Report { }
}
```

#### Open/Closed Principle (OCP)
- Classes should be open for extension but closed for modification
- Use abstractions and polymorphism to add new behavior

**Good Example:**
```typescript
interface TaskProcessor {
    process(task: Task): Promise<void>;
}

class EmailTaskProcessor implements TaskProcessor {
    process(task: Task): Promise<void> { }
}

class SlackTaskProcessor implements TaskProcessor {
    process(task: Task): Promise<void> { }
}

// Adding new processors doesn't modify existing code
class TaskProcessorManager {
    constructor(private processors: TaskProcessor[]) {}
    
    async processAll(task: Task): Promise<void> {
        for (const processor of this.processors) {
            await processor.process(task);
        }
    }
}
```

### Domain-Driven Design (DDD)

#### Core Concepts

##### Entities
- Objects with identity that persists over time
- Identity is immutable, attributes can change

```typescript
export class Task {
    constructor(
        private readonly id: TaskId,
        private title: string,
        private status: TaskStatus,
        private assignee?: UserId
    ) {}
    
    // Identity comparison
    equals(other: Task): boolean {
        return this.id.equals(other.id);
    }
    
    // Business logic methods
    assign(userId: UserId): void {
        if (this.status === TaskStatus.COMPLETED) {
            throw new Error("Cannot assign completed task");
        }
        this.assignee = userId;
    }
}
```

##### Value Objects
- Objects without identity, compared by value
- Immutable after creation

```typescript
export class TaskId {
    constructor(private readonly value: string) {
        if (!value || value.length === 0) {
            throw new Error("TaskId cannot be empty");
        }
    }
    
    equals(other: TaskId): boolean {
        return this.value === other.value;
    }
    
    toString(): string {
        return this.value;
    }
}

export class Email {
    private readonly value: string;
    
    constructor(value: string) {
        if (!this.isValid(value)) {
            throw new Error("Invalid email format");
        }
        this.value = value;
    }
    
    private isValid(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}
```

##### Aggregates
- Cluster of entities and value objects
- Enforce consistency boundaries
- Access only through aggregate root

```typescript
export class Project {
    private tasks: Task[] = [];
    
    constructor(
        private readonly id: ProjectId,
        private name: string,
        private owner: UserId
    ) {}
    
    // All task operations go through the aggregate root
    addTask(taskData: CreateTaskData): Task {
        if (this.tasks.length >= 100) {
            throw new Error("Project cannot have more than 100 tasks");
        }
        
        const task = new Task(
            new TaskId(generateId()),
            taskData.title,
            TaskStatus.PENDING
        );
        
        this.tasks.push(task);
        return task;
    }
    
    removeTask(taskId: TaskId): void {
        const index = this.tasks.findIndex(t => t.id.equals(taskId));
        if (index === -1) {
            throw new Error("Task not found in project");
        }
        this.tasks.splice(index, 1);
    }
}
```

##### Domain Services
- Operations that don't belong to entities or value objects
- Stateless operations

```typescript
export class TaskPriorityCalculator {
    calculate(
        task: Task, 
        project: Project, 
        userWorkload: UserWorkload
    ): Priority {
        // Complex calculation logic that involves multiple domain objects
        let score = 0;
        
        if (task.isOverdue()) score += 50;
        if (project.isHighPriority()) score += 30;
        if (userWorkload.isOverloaded()) score += 20;
        
        return score > 70 ? Priority.HIGH : 
               score > 40 ? Priority.MEDIUM : 
               Priority.LOW;
    }
}
```

##### Repositories
- Abstraction for persistence
- Deal with aggregate roots only

```typescript
export interface ProjectRepository {
    save(project: Project): Promise<void>;
    findById(id: ProjectId): Promise<Project | null>;
    findByOwner(ownerId: UserId): Promise<Project[]>;
}

// Implementation is in infrastructure layer
export class PostgresProjectRepository implements ProjectRepository {
    async save(project: Project): Promise<void> {
        // Save aggregate and all its entities
    }
    
    async findById(id: ProjectId): Promise<Project | null> {
        // Reconstruct entire aggregate
    }
}
```

#### Layered Architecture

##### Domain-Centric Organization
Organize code by business domains rather than technical categories. Each domain contains its own entities, value objects, and services.

```
src/
├── domain/                      # Core business logic
│   ├── task/                    # Task domain
│   │   ├── entities/
│   │   │   ├── task.entity.ts
│   │   │   └── task-comment.entity.ts
│   │   ├── value-objects/
│   │   │   ├── task-id.vo.ts
│   │   │   ├── task-status.vo.ts
│   │   │   └── priority.vo.ts
│   │   ├── aggregates/
│   │   │   └── task.aggregate.ts
│   │   ├── services/
│   │   │   ├── task-priority-calculator.service.ts
│   │   │   └── task-assignment.service.ts
│   │   ├── repositories/
│   │   │   └── task.repository.ts
│   │   └── events/
│   │       ├── task-created.event.ts
│   │       └── task-completed.event.ts
│   │
│   ├── project/                 # Project domain
│   │   ├── entities/
│   │   │   └── project.entity.ts
│   │   ├── value-objects/
│   │   │   ├── project-id.vo.ts
│   │   │   └── project-status.vo.ts
│   │   ├── aggregates/
│   │   │   └── project.aggregate.ts
│   │   ├── repositories/
│   │   │   └── project.repository.ts
│   │   └── services/
│   │       └── project-metrics.service.ts
│   │
│   ├── user/                    # User domain
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── value-objects/
│   │   │   ├── user-id.vo.ts
│   │   │   ├── email.vo.ts
│   │   │   └── role.vo.ts
│   │   └── repositories/
│   │       └── user.repository.ts
│   │
│   └── shared/                  # Shared domain concepts
│       ├── value-objects/
│       │   ├── date-range.vo.ts
│       │   └── money.vo.ts
│       └── interfaces/
│           └── domain-event.interface.ts
│
├── application/                 # Use cases / Application services
│   ├── task/
│   │   ├── commands/
│   │   │   ├── create-task/
│   │   │   │   ├── create-task.command.ts
│   │   │   │   └── create-task.handler.ts
│   │   │   └── complete-task/
│   │   │       ├── complete-task.command.ts
│   │   │       └── complete-task.handler.ts
│   │   ├── queries/
│   │   │   ├── get-task-by-id/
│   │   │   │   ├── get-task-by-id.query.ts
│   │   │   │   └── get-task-by-id.handler.ts
│   │   │   └── list-tasks/
│   │   │       ├── list-tasks.query.ts
│   │   │       └── list-tasks.handler.ts
│   │   └── services/
│   │       └── task-notification.service.ts
│   │
│   ├── project/
│   │   ├── commands/
│   │   └── queries/
│   │
│   └── shared/
│       ├── interfaces/
│       │   ├── command.interface.ts
│       │   └── query.interface.ts
│       └── decorators/
│           └── transactional.decorator.ts
│
├── infrastructure/              # Technical details
│   ├── persistence/
│   │   ├── typeorm/            # Or your ORM of choice
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   │   ├── task.repository.impl.ts
│   │   │   │   └── project.repository.impl.ts
│   │   │   └── migrations/
│   │   └── mappers/
│   │       ├── task.mapper.ts
│   │       └── project.mapper.ts
│   │
│   ├── messaging/
│   │   ├── event-bus/
│   │   └── message-queue/
│   │
│   └── external/
│       ├── email/
│       └── storage/
│
└── presentation/                # API / UI
    ├── rest/                    # REST API
    │   ├── task/
    │   │   ├── task.controller.ts
    │   │   ├── dto/
    │   │   │   ├── create-task.dto.ts
    │   │   │   └── task-response.dto.ts
    │   │   └── validators/
    │   │       └── task.validator.ts
    │   ├── project/
    │   │   ├── project.controller.ts
    │   │   └── dto/
    │   └── shared/
    │       ├── filters/
    │       ├── interceptors/
    │       └── middleware/
    │
    └── graphql/                 # GraphQL API (if applicable)
        ├── task/
        │   ├── task.resolver.ts
        │   └── task.schema.ts
        └── project/
```

##### File Naming Conventions

- **Entities**: `[name].entity.ts` (e.g., `task.entity.ts`)
- **Value Objects**: `[name].vo.ts` (e.g., `task-id.vo.ts`)
- **Aggregates**: `[name].aggregate.ts` (e.g., `project.aggregate.ts`)
- **Repositories**: `[name].repository.ts` (interface) and `[name].repository.impl.ts` (implementation)
- **Services**: `[name].service.ts` (e.g., `task-priority-calculator.service.ts`)
- **Commands/Queries**: Group in folders with handler (e.g., `create-task/create-task.command.ts`)
- **DTOs**: `[action]-[entity].dto.ts` (e.g., `create-task.dto.ts`, `task-response.dto.ts`)

### DRY (Don't Repeat Yourself)

#### Principles
- Every piece of knowledge should have a single, unambiguous representation
- Avoid duplication of logic, not just code
- Extract common patterns into reusable components

#### Good Practices

##### Extract Common Logic
```typescript
// Bad - Repeated validation logic
class UserController {
    createUser(data: any) {
        if (!data.email || !data.email.includes('@')) {
            throw new Error('Invalid email');
        }
        // create user
    }
    
    updateUser(data: any) {
        if (!data.email || !data.email.includes('@')) {
            throw new Error('Invalid email');
        }
        // update user
    }
}

// Good - Extracted validation
class EmailValidator {
    static validate(email: string): void {
        if (!email || !email.includes('@')) {
            throw new Error('Invalid email');
        }
    }
}

class UserController {
    createUser(data: any) {
        EmailValidator.validate(data.email);
        // create user
    }
    
    updateUser(data: any) {
        EmailValidator.validate(data.email);
        // update user
    }
}
```

##### Use Composition and Inheritance Wisely
```typescript
// Composition for shared behavior
class TimeStampable {
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
    
    touch(): void {
        this.updatedAt = new Date();
    }
}

class Task {
    timestamps = new TimeStampable();
    // Task specific logic
}

class Project {
    timestamps = new TimeStampable();
    // Project specific logic
}
```

##### Configuration Over Code Duplication
```typescript
// Bad - Repeated configuration
class EmailService {
    sendWelcomeEmail() {
        const config = {
            from: 'noreply@app.com',
            replyTo: 'support@app.com',
            // ...
        };
    }
    
    sendPasswordReset() {
        const config = {
            from: 'noreply@app.com',
            replyTo: 'support@app.com',
            // ...
        };
    }
}

// Good - Centralized configuration
class EmailConfig {
    static readonly DEFAULT = {
        from: 'noreply@app.com',
        replyTo: 'support@app.com',
        // ...
    };
}

class EmailService {
    sendWelcomeEmail() {
        const config = { ...EmailConfig.DEFAULT };
    }
    
    sendPasswordReset() {
        const config = { ...EmailConfig.DEFAULT };
    }
}
```

### Test-Driven Development (TDD)

#### The TDD Cycle
1. **Red**: Write a failing test
2. **Green**: Write minimal code to pass the test
3. **Refactor**: Improve code while keeping tests green

#### Best Practices

##### Write Tests First
```typescript
// 1. Write the test first
describe('TaskService', () => {
    it('should create a task with pending status', async () => {
        const service = new TaskService();
        const task = await service.create({
            title: 'New Task',
            description: 'Description'
        });
        
        expect(task.status).toBe(TaskStatus.PENDING);
        expect(task.title).toBe('New Task');
    });
});

// 2. Then implement minimal code to pass
class TaskService {
    async create(data: CreateTaskData): Promise<Task> {
        return new Task(
            new TaskId(generateId()),
            data.title,
            TaskStatus.PENDING,
            data.description
        );
    }
}
```

##### Test Behavior, Not Implementation
```typescript
// Bad - Testing implementation details
it('should call validateTask method', () => {
    const spy = jest.spyOn(service, 'validateTask');
    service.create({ title: 'Task' });
    expect(spy).toHaveBeenCalled();
});

// Good - Testing behavior
it('should throw error when title is empty', () => {
    expect(() => {
        service.create({ title: '' });
    }).toThrow('Title cannot be empty');
});
```

##### Keep Tests Simple and Focused
```typescript
// One assertion per test when possible
describe('Task', () => {
    it('should be created with pending status', () => {
        const task = new Task('Title');
        expect(task.status).toBe(TaskStatus.PENDING);
    });
    
    it('should have creation timestamp', () => {
        const task = new Task('Title');
        expect(task.createdAt).toBeInstanceOf(Date);
    });
});
```

##### Use Test Doubles Appropriately
```typescript
// Mock external dependencies
class TaskService {
    constructor(
        private repository: TaskRepository,
        private notifier: NotificationService
    ) {}
    
    async create(data: CreateTaskData): Promise<Task> {
        const task = new Task(data.title);
        await this.repository.save(task);
        await this.notifier.notify('Task created');
        return task;
    }
}

// Test with mocks
it('should save task and send notification', async () => {
    const mockRepo = { save: jest.fn() };
    const mockNotifier = { notify: jest.fn() };
    
    const service = new TaskService(mockRepo, mockNotifier);
    await service.create({ title: 'Test' });
    
    expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Test' })
    );
    expect(mockNotifier.notify).toHaveBeenCalledWith('Task created');
});
```

##### Test Structure Pattern
```typescript
describe('Component/Class', () => {
    describe('method/scenario', () => {
        it('should behave in specific way given specific conditions', () => {
            // Arrange
            const input = createTestData();
            
            // Act
            const result = systemUnderTest.method(input);
            
            // Assert
            expect(result).toMatchExpectedOutcome();
        });
    });
});
```

## General Guidelines

1. **Prefer composition over inheritance**
2. **Write code for humans, not computers**
3. **Make the implicit explicit**
4. **Fail fast with clear error messages**
5. **Use meaningful names that reveal intent**
6. **Keep functions and classes small**
7. **Avoid premature optimization**
8. **Refactor continuously with confidence (tests)**

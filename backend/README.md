# Taskman Backend

## Prisma Commands

### Migrations
```bash
# Create and apply migration (dev only)
deno run -A npm:prisma@latest migrate dev --name <name>

# Create migration without applying
deno run -A npm:prisma@latest migrate dev --create-only --name <name>

# Apply migrations (production/CI)
deno run -A npm:prisma@latest migrate deploy

# Check migration status
deno run -A npm:prisma@latest migrate status

# Reset database (WARNING: deletes all data!)
deno run -A npm:prisma@latest migrate reset
```

### Database Operations
```bash
# Push schema without creating migration
deno run -A npm:prisma@latest db push

# Pull schema from existing database
deno run -A npm:prisma@latest db pull

# Generate Prisma Client
deno run -A npm:prisma@latest generate

# Format schema file
deno run -A npm:prisma@latest format
```

### Troubleshooting
```bash
# Mark failed migration as applied
deno run -A npm:prisma@latest resolve --applied <migration_name>

# Mark failed migration as rolled back
deno run -A npm:prisma@latest resolve --rolled-back <migration_name>
```

### Quick Tips
- Use `migrate dev` in development only
- Use `migrate deploy` in production/CI
- Always commit migration files
- Never edit applied migrations
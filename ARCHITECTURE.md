# This project is split across the following modules 

## Overview 

The system contains three main components:
1. **TaskMan Backend**: A REST webserver that handles all persistent data, tasks, and AI chat history.
2. **TaskMan CLI**: A command line TUI interface that allows users to interact with the TaskMan backend.
3. **Postgres Database**: A PostgreSQL database that stores all persistent data, tasks, and metadata.

## TaskMan Backend 
The TaskMan backend runs as a REST webserver. This is what the clients connect to.

#### Core Responsibilities:

- Storing all persistent data, tasks, task metadata and ai chat history, some user metadata (most user info in identity provider, like Google, Apple, etc).
- Running asynchronous ai tasks.
- Providing a REST API for clients to interact with the system.

#### Technologies:
- Deno 2.4.2 
- PostgreSQL 16.x 
- Prisma ORM 
- Deno HTTP & Oak web framework

## TaskMan Cli
The TaskMan CLI is a command line interface that allows users to interact with the TaskMan backend.
It is a TUI based interface driven by quick keyboard shortcuts, intended for maximum efficiency. It 
connects to the TaskMan backend via the REST API and provides a user-friendly interface for managing tasks.

#### Core Responsibilities:
- Providing a TUI interface for users to interact with the TaskMan backend.
- Allowing users to create, manage, and view tasks.
- Providing a way to interact with the AI chat history and task metadata.

#### Technologies:
- Deno 2.4.2
- Ink TUI library
- React 18.x
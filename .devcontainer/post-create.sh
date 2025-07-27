#!/bin/bash

# Install Claude Code.
npm install -g @anthropic-ai/claude-code

# Add postgres host entry to /etc/hosts
echo '127.0.0.1 postgres' | sudo tee -a /etc/hosts

# Generate Prisma client
deno install
pushd /workspaces/taskman/backend
deno run -A npm:prisma@latest generate
popdT
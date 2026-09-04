#!/bin/sh

# Use pnpm instead of npm
set -e

# Install pnpm if not present
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
fi

# Install dependencies
pnpm install --frozen-lockfile

# Build the project
pnpm turbo run build
#!/usr/bin/env bash
# Render build script — compiles native modules like better-sqlite3 from source

set -e
echo "⚙️  Installing dependencies (build-from-source)..."
npm install --build-from-source
echo "✅ Build complete."

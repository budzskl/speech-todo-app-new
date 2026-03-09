#!/bin/bash
set -e

cd "$(dirname "$0")/react-frontend"

npm install
npm run dev

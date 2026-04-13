#!/bin/bash
set -e

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
  echo -e "${BLUE}==> ${1}${NC}"
}

print_success() {
  echo -e "${GREEN}✓ ${1}${NC}"
}

print_status "Setting up smokeys-qr project"
echo ""

print_status "Installing dependencies..."
npm install
print_success "Dependencies installed"
echo ""

print_status "Generating Prisma client..."
npx prisma generate
print_success "Prisma client generated"
echo ""

print_status "Running database migrations..."
npx prisma db push
print_success "Database migrations completed"
echo ""

print_status "Seeding database..."
npx tsx prisma/seed.ts
print_success "Database seeded"
echo ""

print_success "Setup complete!"
echo -e "${GREEN}Ready! Run: npm run dev${NC}"

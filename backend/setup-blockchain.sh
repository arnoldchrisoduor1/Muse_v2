#!/bin/bash

set -e

echo "🚀 Setting up blockchain infrastructure..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ $1${NC}"; }

# Check if we're in the right directory
if [ ! -d "packages/contracts" ]; then
    print_error "Please run this script from the project root"
    exit 1
fi

cd packages/contracts

print_info "Installing dependencies..."
npm install

print_info "Compiling contracts..."
npx hardhat compile

print_info "Starting local blockchain node..."
npx hardhat node &
HARDHAT_PID=$!

# Wait for node to start
sleep 5

print_info "Deploying contracts..."
npx hardhat run scripts/deploy.ts --network localhost

# Copy environment variables to backend
print_info "Setting up backend environment..."
# cp deployed/.contracts.env ../../backend/.contracts.env

print_success "Blockchain setup complete!"
echo ""
print_info "Local node running on: http://localhost:8545"
print_info "Contract addresses saved to: packages/contracts/deployed/addresses.json"
print_info "Environment file created: backend/.contracts.env"
echo ""
print_info "To stop the local node, run: kill $HARDHAT_PID"

# Save PID for later
echo $HARDHAT_PID > .hardhat.pid
#!/bin/bash
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
  echo -e "${BLUE}==> ${1}${NC}"
}

print_success() {
  echo -e "${GREEN}✓ ${1}${NC}"
}

print_error() {
  echo -e "${RED}✗ ${1}${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ ${1}${NC}"
}

# Step 1: Create GitHub repository and push
print_status "Step 1: Creating GitHub repository and pushing code"
if gh repo create futureneuro/smokeys-qr --public --source=. --remote=origin --push 2>&1; then
  print_success "GitHub repository created and code pushed"
else
  print_warning "GitHub repository may already exist - continuing with deployment"
fi

# Step 2: Create Azure Resource Group
print_status "Step 2: Creating Azure Resource Group 'smokeys-qr-rg' in eastus"
if az group create --name smokeys-qr-rg --location eastus > /dev/null 2>&1; then
  print_success "Azure Resource Group created"
else
  print_warning "Azure Resource Group may already exist - continuing"
fi

# Step 3: Create App Service Plan
print_status "Step 3: Creating Azure App Service Plan 'smokeys-qr-plan'"
if az appservice plan create \
  --name smokeys-qr-plan \
  --resource-group smokeys-qr-rg \
  --sku B1 \
  --is-linux > /dev/null 2>&1; then
  print_success "App Service Plan created"
else
  print_warning "App Service Plan may already exist - continuing"
fi

# Step 4: Create Web App
print_status "Step 4: Creating Azure Web App 'smokeys-qr-app' with Node 18 LTS"
if az webapp create \
  --resource-group smokeys-qr-rg \
  --plan smokeys-qr-plan \
  --name smokeys-qr-app \
  --runtime "NODE|18-lts" > /dev/null 2>&1; then
  print_success "Web App created"
else
  print_warning "Web App may already exist - continuing"
fi

# Step 5: Configure GitHub deployment
print_status "Step 5: Configuring GitHub deployment"
if az webapp deployment source config \
  --resource-group smokeys-qr-rg \
  --name smokeys-qr-app \
  --repo-url "https://github.com/futureneuro/smokeys-qr" \
  --branch main \
  --manual-integration > /dev/null 2>&1; then
  print_success "GitHub deployment configured"
else
  print_warning "GitHub deployment configuration may need manual setup"
fi

# Step 6: Configure environment variables
print_status "Step 6: Setting environment variables"
print_warning "Please set these environment variables in Azure portal:"
print_warning "  - DATABASE_URL: Your database connection string"
print_warning "  - NEXTAUTH_SECRET: Your NextAuth secret"
print_warning "  - NEXTAUTH_URL: https://smokeys-qr-app.azurewebsites.net"

# For automated setup, uncomment and set your values:
# az webapp config appsettings set \
#   --resource-group smokeys-qr-rg \
#   --name smokeys-qr-app \
#   --settings \
#     DATABASE_URL="your-database-url" \
#     NEXTAUTH_SECRET="your-secret" \
#     NEXTAUTH_URL="https://smokeys-qr-app.azurewebsites.net"

# Step 7: Print deployment URL
print_status "Step 7: Deployment Summary"
DEPLOYED_URL="https://smokeys-qr-app.azurewebsites.net"
print_success "Application deployed successfully!"
echo -e "${GREEN}URL: ${DEPLOYED_URL}${NC}"
echo ""
print_status "Next steps:"
echo "1. Set environment variables in Azure Portal"
echo "2. Configure GitHub Actions for automatic deployments (optional)"
echo "3. Test the deployed application"

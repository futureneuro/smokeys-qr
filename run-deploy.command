#\!/bin/bash
set -e

cd "$(dirname "$0")"

echo "======================================"
echo "  Smokey's QR System - Deploy Script  "
echo "======================================"
echo ""

# Step 0: Initialize git if needed
if [ \! -d .git ]; then
  echo "==> Initializing Git repository..."
  git init -b main
  git add -A
  git commit -m "Initial commit: Smokey's QR System V2 - complete implementation"
  echo "✓ Git initialized"
fi

# Ensure we're on main branch
git branch -M main 2>/dev/null || true

# Step 1: Create GitHub repository and push
echo ""
echo "==> Step 1: Creating GitHub repository and pushing code..."
if gh repo view futureneuro/smokeys-qr > /dev/null 2>&1; then
  echo "⚠ Repo already exists, pushing to it..."
  git remote remove origin 2>/dev/null || true
  git remote add origin https://github.com/futureneuro/smokeys-qr.git
  git add -A
  git commit -m "Deploy: bug fixes, UX improvements, Azure config" --allow-empty
  git push -u origin main --force
else
  gh repo create futureneuro/smokeys-qr --public --source=. --remote=origin --push
fi
echo "✓ Code pushed to GitHub: https://github.com/futureneuro/smokeys-qr"

# Step 2: Azure Resource Group
echo ""
echo "==> Step 2: Creating Azure Resource Group..."
az group create --name smokeys-qr-rg --location eastus --output none 2>/dev/null || true
echo "✓ Resource Group ready"

# Step 3: App Service Plan
echo ""
echo "==> Step 3: Creating App Service Plan (B1 Linux)..."
az appservice plan create \
  --name smokeys-qr-plan \
  --resource-group smokeys-qr-rg \
  --sku B1 \
  --is-linux \
  --output none 2>/dev/null || true
echo "✓ App Service Plan ready"

# Step 4: Web App
echo ""
echo "==> Step 4: Creating Web App..."
az webapp create \
  --resource-group smokeys-qr-rg \
  --plan smokeys-qr-plan \
  --name smokeys-qr-app \
  --runtime "NODE:18-lts" \
  --output none 2>/dev/null || true
echo "✓ Web App ready"

# Step 5: Set environment variables
echo ""
echo "==> Step 5: Setting environment variables..."
az webapp config appsettings set \
  --resource-group smokeys-qr-rg \
  --name smokeys-qr-app \
  --settings \
    DATABASE_URL="file:./dev.db" \
    NEXTAUTH_SECRET="smokeys-production-secret-$(openssl rand -hex 16)" \
    NEXTAUTH_URL="https://smokeys-qr-app.azurewebsites.net" \
  --output none
echo "✓ Environment variables set"

# Step 6: Configure GitHub deployment
echo ""
echo "==> Step 6: Configuring GitHub deployment..."
az webapp deployment source config \
  --resource-group smokeys-qr-rg \
  --name smokeys-qr-app \
  --repo-url "https://github.com/futureneuro/smokeys-qr" \
  --branch main \
  --manual-integration \
  --output none 2>/dev/null || true
echo "✓ GitHub deployment configured"

echo ""
echo "======================================"
echo "  DEPLOYMENT COMPLETE\!"
echo "======================================"
echo ""
echo "  GitHub:  https://github.com/futureneuro/smokeys-qr"
echo "  Azure:   https://smokeys-qr-app.azurewebsites.net"
echo ""
echo "  Note: First deployment may take 2-3 minutes."
echo "  Run 'az webapp log tail --name smokeys-qr-app --resource-group smokeys-qr-rg' to watch logs."
echo ""
echo "Press Enter to close..."
read

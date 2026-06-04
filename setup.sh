#!/bin/bash

# Business Card Scanner App - Setup Script with Colors

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Business Card Scanner - Setup${NC}"
echo "==========================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "Install from: https://nodejs.org/"
    exit 1
fi
NODE_V=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_V}${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
NPM_V=$(npm -v)
echo -e "${GREEN}✓ npm ${NPM_V}${NC}"

echo ""
echo -e "${BLUE}📦 Installing npm dependencies...${NC}"
npm install

echo ""
# iOS setup (Mac only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "${BLUE}🍎 Installing CocoaPods for iOS...${NC}"
    cd ios
    pod install
    cd ..
    echo -e "${GREEN}✓ CocoaPods setup complete${NC}"
    echo ""
fi

echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "   1. npm start              - Start Metro bundler"
echo "   2. npm run ios            - Run on iOS simulator"
echo "   3. npm run android        - Run on Android emulator"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC}"
echo "   - README.md               - Project overview"
echo "   - DEPLOYMENT_IOS.md       - App Store deployment"
echo "   - DEPLOYMENT_ANDROID.md   - Play Store deployment"
echo "   - MONETIZATION.md         - Revenue strategies"

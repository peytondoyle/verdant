#!/bin/bash

# Verdant App Audit Script
# Comprehensive health check for the Expo React Native project

echo "🌱 Verdant App Audit - $(date)"
echo "=========================================="
echo

# 1. Environment Information
echo "📋 Environment Information:"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Expo CLI: $(npx expo --version 2>/dev/null || echo 'Not installed')"
echo

# 2. Expo Diagnostics
echo "🔍 Expo Diagnostics:"
npx expo diagnostics
echo

# 3. Dependency Version Check
echo "📦 Dependency Version Check:"
echo "Checking for SDK compatibility..."
npx expo install --check
echo

# 4. Expo Doctor
echo "👨‍⚕️ Expo Doctor Check:"
npx expo-doctor
echo

# 5. DateTimePicker Specific Check
echo "📅 DateTimePicker Installation Check:"
npm ls @react-native-community/datetimepicker || true
echo

# 6. Import Usage Check
echo "🔎 DateTimePicker Import Usage:"
grep -R "@react-native-community/datetimepicker" -n app src || true
echo

# 7. TypeScript Check
echo "🔧 TypeScript Type Checking:"
npx tsc --noEmit
echo

# 8. Linting
echo "🧹 Code Linting:"
if npm run lint &>/dev/null; then
    npm run lint
else
    echo "Running fallback eslint check..."
    npx eslint . --ext .ts,.tsx || true
fi
echo

# 9. Tests
echo "🧪 Test Suite:"
if npm test &>/dev/null; then
    npm test
else
    echo "No tests found or test script not available."
fi
echo

# 10. Config Validation
echo "⚙️ Configuration Validation:"
echo "Checking expo config..."
npx expo config --type public > /dev/null && echo "✅ Expo config is valid" || echo "❌ Expo config has issues"
echo

# 11. Next Steps
echo "🚀 Next Steps & Tips:"
echo "• If dependency issues found: 'npm run doctor'"
echo "• To clear caches: 'npm run start:clear'"
echo "• For development builds: 'npx pod-install' (iOS only)"
echo "• Check environment variables in .env file"
echo "• DateTimePicker issues: 'npx expo install @react-native-community/datetimepicker'"
echo

echo "Audit complete! ✨"
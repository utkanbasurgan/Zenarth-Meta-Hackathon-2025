#!/bin/bash

# Test Website Launcher
# Opens the test website in your default browser

echo "🚀 Opening Test Website..."
echo "📁 Location: $(pwd)/website.html"
echo "🌐 Opening in browser..."

# Get the full path to the website
WEBSITE_PATH="file://$(pwd)/website.html"

# Open in default browser
if command -v open >/dev/null 2>&1; then
    # macOS
    open "$WEBSITE_PATH"
elif command -v xdg-open >/dev/null 2>&1; then
    # Linux
    xdg-open "$WEBSITE_PATH"
elif command -v start >/dev/null 2>&1; then
    # Windows
    start "$WEBSITE_PATH"
else
    echo "❌ Could not find a way to open the browser automatically"
    echo "Please open this URL manually: $WEBSITE_PATH"
    exit 1
fi

echo "✅ Test website opened!"
echo ""
echo "📋 What this website does:"
echo "  • Connects to http://localhost:3000/test"
echo "  • Logs all test activities in main_log.txt"
echo "  • Logs console errors in live_log.txt"
echo "  • Provides real-time monitoring"
echo ""
echo "🔧 To use:"
echo "  1. Make sure you have a server running on port 3000"
echo "  2. The website will automatically start testing"
echo "  3. Use the buttons to control testing"
echo "  4. Download logs when needed"

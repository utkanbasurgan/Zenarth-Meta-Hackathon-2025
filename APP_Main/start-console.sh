#!/bin/bash

# Set the API directory path
API_DIR="/Users/utkan.basurgan/Main/1. Works Files/2. Gits Works/Zenarth-Meta-Hackathon-2025/APP_Api"

# Create virtual environment in APP_Main if it doesn't exist (for general use)
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment in APP_Main..."
    python3 -m venv venv
fi

# Ensure APP_Api has its virtual environment with dependencies
if [ ! -d "$API_DIR/venv" ]; then
    echo "Creating Python virtual environment in APP_Api..."
    python3 -m venv "$API_DIR/venv"
fi

# Install/update dependencies in APP_Api virtual environment
echo "Ensuring APP_Api dependencies are installed..."
cd "$API_DIR"
source venv/bin/activate
pip install -r requirements.txt
cd - > /dev/null

# Activate the main virtual environment
echo "Activating Python virtual environment..."
source venv/bin/activate

# Start the Console API server in the background
echo "Starting Console API server..."
npm run console-api &
API_PID=$!

# Wait a moment for the API server to start
sleep 2

# Start the React development server
echo "Starting React development server..."
npm start

# When React server stops, kill the API server
echo "Stopping Console API server..."
kill $API_PID

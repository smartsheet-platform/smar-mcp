#!/bin/bash

# Script to set up Claude Desktop configuration for Smartsheet MCP Server

echo "Setting up Claude Desktop configuration for Smartsheet MCP Server..."

# Detect operating system
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CONFIG_DIR="$HOME/Library/Application Support/Claude"
    echo "Detected macOS: Config directory is $CONFIG_DIR"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    CONFIG_DIR="$APPDATA/Claude"
    echo "Detected Windows: Config directory is $CONFIG_DIR"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    CONFIG_DIR="$HOME/.config/Claude"
    echo "Detected Linux: Config directory is $CONFIG_DIR"
else
    echo "Unsupported operating system: $OSTYPE"
    exit 1
fi

# Create config directory if it doesn't exist
mkdir -p "$CONFIG_DIR"
if [ $? -ne 0 ]; then
    echo "Error: Failed to create config directory $CONFIG_DIR"
    exit 1
fi

# Copy the configuration file
cp claude_desktop_config.json "$CONFIG_DIR/claude_desktop_config.json"
if [ $? -ne 0 ]; then
    echo "Error: Failed to copy configuration file to $CONFIG_DIR"
    exit 1
fi

echo "Configuration file successfully copied to $CONFIG_DIR/claude_desktop_config.json"
echo "Please restart Claude Desktop to apply the changes."

# Provide instructions for testing
echo ""
echo "To test the integration:"
echo "1. Start Claude Desktop"
echo "2. Try using one of the Smartsheet MCP tools:"
echo "   - search-sheets"
echo "   - get-sheet"
echo "   - get-sheet-as-csv"
echo ""
echo "Example: Ask Claude 'Can you search for sheets in my Smartsheet account?'"
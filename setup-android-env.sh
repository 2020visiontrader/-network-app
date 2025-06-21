#!/bin/bash

# This script sets up ANDROID_HOME environment variable
echo "Setting up ANDROID_HOME environment variable"

# Determine which shell configuration file to use
SHELL_RC=""
if [ -f "$HOME/.zshrc" ]; then
  SHELL_RC="$HOME/.zshrc"
  echo "Using .zshrc as shell configuration file"
elif [ -f "$HOME/.bash_profile" ]; then
  SHELL_RC="$HOME/.bash_profile"
  echo "Using .bash_profile as shell configuration file"
elif [ -f "$HOME/.bashrc" ]; then
  SHELL_RC="$HOME/.bashrc"
  echo "Using .bashrc as shell configuration file"
else
  echo "Creating .zshrc as shell configuration file"
  SHELL_RC="$HOME/.zshrc"
  touch "$SHELL_RC"
fi

# Check if ANDROID_HOME is already set
if grep -q "ANDROID_HOME" "$SHELL_RC"; then
  echo "ANDROID_HOME is already defined in $SHELL_RC"
else
  # Add ANDROID_HOME to shell configuration
  echo "Adding ANDROID_HOME to $SHELL_RC"
  echo "" >> "$SHELL_RC"
  echo "# Android SDK location" >> "$SHELL_RC"
  echo "export ANDROID_HOME=\$HOME/Library/Android/sdk" >> "$SHELL_RC"
  echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> "$SHELL_RC"
  echo "export PATH=\$PATH:\$ANDROID_HOME/tools" >> "$SHELL_RC"
  echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin" >> "$SHELL_RC"
  echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> "$SHELL_RC"
fi

echo ""
echo "To apply these changes, run:"
echo "source $SHELL_RC"
echo ""
echo "Then restart your terminal or Expo development server."

#!/bin/bash

# Direct Expo QR Code Generator
# Simplified script with minimal options

echo "Generating QR code for Expo Go..."
echo "Please scan the QR code with your Expo Go app when it appears"

# Run Expo with tunnel option for better connectivity
npx expo start --tunnel

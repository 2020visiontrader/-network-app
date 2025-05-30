#!/bin/bash

# Network App Deployment Script
# This script helps deploy the Network app to various platforms

set -e  # Exit on any error

echo "🚀 Network App Deployment Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_status "Dependencies check passed"
}

# Install dependencies
install_deps() {
    print_info "Installing dependencies..."
    npm install
    print_status "Dependencies installed"
}

# Run tests and linting
run_checks() {
    print_info "Running pre-deployment checks..."
    
    # Type checking
    print_info "Checking TypeScript..."
    npm run type-check || {
        print_error "TypeScript errors found. Please fix them before deploying."
        exit 1
    }
    
    # Linting
    print_info "Running linter..."
    npm run lint || {
        print_warning "Linting issues found. Consider fixing them."
    }
    
    print_status "Pre-deployment checks completed"
}

# Build the application
build_app() {
    print_info "Building application..."
    npm run build || {
        print_error "Build failed. Please fix build errors before deploying."
        exit 1
    }
    print_status "Application built successfully"
}

# Deploy to Vercel
deploy_vercel() {
    print_info "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_info "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    print_info "Starting Vercel deployment..."
    vercel --prod
    
    print_status "Deployed to Vercel successfully!"
}

# Deploy to Netlify
deploy_netlify() {
    print_info "Deploying to Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        print_info "Installing Netlify CLI..."
        npm install -g netlify-cli
    fi
    
    print_info "Starting Netlify deployment..."
    netlify deploy --prod --dir=.next
    
    print_status "Deployed to Netlify successfully!"
}

# Check environment variables
check_env_vars() {
    print_info "Checking environment variables..."
    
    if [ -f ".env.local" ]; then
        print_status "Found .env.local file"
    else
        print_warning "No .env.local file found. Make sure environment variables are set in your deployment platform."
    fi
    
    # Check for required variables in .env.local if it exists
    if [ -f ".env.local" ]; then
        if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
            print_status "Supabase URL found"
        else
            print_warning "NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
        fi
        
        if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
            print_status "Supabase anon key found"
        else
            print_warning "NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local"
        fi
    fi
}

# Main deployment function
deploy() {
    local platform=$1
    
    echo ""
    print_info "Starting deployment process..."
    echo ""
    
    # Run all checks
    check_dependencies
    check_env_vars
    install_deps
    run_checks
    build_app
    
    echo ""
    print_info "Pre-deployment completed successfully!"
    echo ""
    
    # Deploy to specified platform
    case $platform in
        "vercel")
            deploy_vercel
            ;;
        "netlify")
            deploy_netlify
            ;;
        *)
            print_info "Manual deployment mode - build completed"
            print_info "You can now deploy the .next folder to your hosting provider"
            ;;
    esac
    
    echo ""
    print_status "🎉 Deployment process completed!"
    echo ""
}

# Show help
show_help() {
    echo "Usage: $0 [platform]"
    echo ""
    echo "Platforms:"
    echo "  vercel    Deploy to Vercel (recommended)"
    echo "  netlify   Deploy to Netlify"
    echo "  manual    Build only (for manual deployment)"
    echo ""
    echo "Examples:"
    echo "  $0 vercel     # Deploy to Vercel"
    echo "  $0 netlify    # Deploy to Netlify"
    echo "  $0 manual     # Build for manual deployment"
    echo "  $0            # Interactive mode"
    echo ""
}

# Interactive mode
interactive_deploy() {
    echo ""
    echo "Select deployment platform:"
    echo "1) Vercel (recommended)"
    echo "2) Netlify"
    echo "3) Manual build only"
    echo "4) Help"
    echo ""
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            deploy "vercel"
            ;;
        2)
            deploy "netlify"
            ;;
        3)
            deploy "manual"
            ;;
        4)
            show_help
            ;;
        *)
            print_error "Invalid choice. Please select 1-4."
            interactive_deploy
            ;;
    esac
}

# Main script logic
main() {
    if [ $# -eq 0 ]; then
        # No arguments - run interactive mode
        interactive_deploy
    elif [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        show_help
    else
        # Deploy to specified platform
        deploy "$1"
    fi
}

# Run main function with all arguments
main "$@"

#!/bin/bash

# Function to generate random password
generate_password() {
    openssl rand -base64 32
}

# Create secrets for different environments
create_env_secrets() {
    local env=$1
    local password=$(generate_password)
    
    # Create the namespace if it doesn't exist
    kubectl create namespace $env --dry-run=client -o yaml | kubectl apply -f -
    
    # Create the secret
    kubectl create secret generic mysql-credentials -n $env \
        --from-literal=MYSQL_ROOT_PASSWORD=$password \
        --from-literal=MYSQL_DATABASE=project_two \
        --dry-run=client -o yaml | kubectl apply -f -
    
    echo "Created secrets for $env environment"
}

# Create secrets for each environment
create_env_secrets "dev"
create_env_secrets "staging"
create_env_secrets "prod"

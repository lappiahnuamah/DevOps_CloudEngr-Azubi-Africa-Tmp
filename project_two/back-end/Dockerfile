# # Use official PHP image with required extensions
# FROM php:8.2-fpm

# # Arguments for docker-compose build
# ARG user
# ARG uid

# # Set working directory
# WORKDIR /var/www

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     git curl libpng-dev libonig-dev libxml2-dev zip unzip \
#     && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# # Install Composer
# COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# # Copy existing app files
# COPY . .

# # Install PHP dependencies
# RUN composer install --no-dev --optimize-autoloader

# # Set permissions
# RUN chown -R www-data:www-data /var/www \
#     && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# # Expose port 9000 and start php-fpm server
# EXPOSE 9000
# CMD ["php-fpm"]


# Use PHP 8.3 with Apache (to match package requirements)
FROM php:8.3-cli

WORKDIR /var/www

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Install Composer
COPY --from=composer:2.6 /usr/bin/composer /usr/bin/composer

# Copy project files
COPY . .


# Ensure .env exists (copy from .env.example if missing)
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

RUN php artisan key:generate

# Expose Laravel port
EXPOSE 8000

# Start Laravel
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000


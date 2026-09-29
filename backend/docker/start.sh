#!/bin/sh

# Modify Nginx configuration to listen on the Render-assigned PORT, default to 80 locally
LISTEN_PORT=${PORT:-80}
sed -i "s/listen 80;/listen ${LISTEN_PORT};/g" /etc/nginx/sites-enabled/default

# Create SQLite database if it doesn't exist
touch /var/www/database/database.sqlite
chown www-data:www-data /var/www/database/database.sqlite

# Run migrations (Force is needed in production to avoid prompts)
php artisan migrate --force

# Seed the Admin accounts
php artisan db:seed --class=AdminSeeder --force

# Start PHP-FPM in background
php-fpm -D

# Start Nginx in foreground
nginx -g "daemon off;"

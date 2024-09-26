FROM php:8.2-apache

# Set timezone to Asia/Bangkok
RUN ln -snf /usr/share/zoneinfo/Asia/Bangkok /etc/localtime && \
    echo "Asia/Bangkok" > /etc/timezone

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim \
    unzip \
    git \
    curl \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libicu-dev \
    libxslt-dev \
    libpq-dev \
    cron \
    libmagickwand-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd zip intl xsl soap pdo_mysql mysqli && \
    pecl install mongodb && \
    docker-php-ext-enable mongodb

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Enable Apache modules
RUN a2enmod rewrite headers

# Create and configure php.ini
RUN echo "date.timezone = Asia/Bangkok" > /usr/local/etc/php/conf.d/99-custom.ini && \
    echo "extension=gd" >> /usr/local/etc/php/conf.d/99-custom.ini


# Set the working directory
WORKDIR /var/www/html

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html

# Install Laravel MongoDB package using Composer
RUN composer require mongodb/laravel-mongodb

# Enable Opcache
COPY ./docker/apache2/php.ini /usr/local/etc/php/conf.d/opcache.ini

# Set up cron jobs
RUN (crontab -l ; echo "* * * * * cd /var/www/html && /usr/local/bin/php artisan app:fetch-data") | crontab -
    RUN (crontab -l ; echo "59 23 * * * sync; echo 1 > /proc/sys/vm/drop_caches") | crontab -
    RUN (crontab -l ; echo "59 23 * * * sync; echo 2 > /proc/sys/vm/drop_caches") | crontab -
    RUN (crontab -l ; echo "59 23 * * * sync; echo 3 > /proc/sys/vm/drop_caches") | crontab -
    RUN service cron start

# Change DocumentRoot to point to the public directory
RUN sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/*.conf && \
    sed -ri -e 's!/var/www/!/var/www/html/public!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Expose port 80
EXPOSE 80
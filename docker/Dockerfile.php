FROM php:latest
RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer
RUN curl -sS https://get.symfony.com/cli/installer | bash
RUN apt update && apt install -y zip git libicu-dev locales
RUN docker-php-ext-install opcache intl pdo_mysql
RUN mv /root/.symfony/bin/symfony /usr/local/bin/symfony
RUN locale-gen fr_FR.UTF-8
WORKDIR /app
COPY ./app/composer.json .
RUN composer install --no-scripts
COPY ./app .
RUN symfony server:ca:install
CMD ["symfony", "serve"]
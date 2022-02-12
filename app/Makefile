analyze:
	php vendor/bin/phpcbf
	php vendor/bin/phpcs

.PHONY: tests vendor
tests: vendor
	make prepare-test
	php vendor/bin/phpunit

.PHONY: sy-start
sy-start: bin
	symfony serve -d

.PHONY: sy-stop
sy-stop: bin
	symfony server:stop

.PHONY: sy-entity
sy-entity: bin
	php bin/console make:entity

.PHONY: sy-controller
sy-controller: bin
	php bin/console make:controller

.PHONY: sy-form
sy-form: bin
	php bin/console make:form

.PHONY: sy-cc
sy-cc: bin
	php bin/console c:c

.PHONY: prepare-dev
prepare-dev: bin
	php bin/console cache:clear --env=dev
	php bin/console doctrine:database:drop --if-exists -f --env=dev
	php bin/console doctrine:database:create --env=dev
	php bin/console doctrine:schema:update -f --env=dev
	php bin/console doctrine:fixtures:load -n --env=dev

.PHONY: prepare-test
prepare-test: bin
	php bin/console cache:clear --env=test
	php bin/console doctrine:database:drop --if-exists -f --env=test
	php bin/console doctrine:database:create --env=test
	php bin/console doctrine:schema:update -f --env=test
	php bin/console doctrine:fixtures:load -n --env=test

.PHONY: db-dev-drop db-dev-create schema-dev-update fixtures-dev-load
db-dev-drop: bin
	php bin/console d:d:d --if-exists -f --env=dev

db-dev-create: bin
	php bin/console d:d:c --env=dev

schema-dev-update: bin
	php bin/console d:s:u -f --env=dev

fixtures-dev-load: bin
	php bin/console d:f:l -n --env=dev

.PHONY: db-test-drop db-test-create schema-test-update fixtures-test-load
db-test-drop: bin
	php bin/console d:d:d --if-exists -f --env=test

db-test-create: bin
	php bin/console d:d:c --env=test

schema-test-update: bin
	php bin/console d:s:u -f --env=test

fixtures-test-load: bin
	php bin/console d:f:l -n --env=test

.PHONY: up
up:
	docker-compose up -d --build

.PHONY: down
down:
	docker-compose down -v

.PHONY: stop
stop:
	docker-compose stop
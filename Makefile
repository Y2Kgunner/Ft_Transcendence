all: build up make-and-apply-migrations bash

SRC_DIR=src

build:
	cd $(SRC_DIR) && docker-compose build
	
up:
	cd $(SRC_DIR) && docker-compose up -d

down:
	cd $(SRC_DIR) && docker-compose down

re: down build up make-and-apply-migrations bash

restart: down up

clean:
	cd $(SRC_DIR) && docker-compose down --rmi all

fclean: clean
	cd $(SRC_DIR) && docker volume rm $$(docker volume ls -q)

makemigrations:
	cd $(SRC_DIR) && docker-compose run --rm django python manage.py makemigrations

migrate:
	cd $(SRC_DIR) && docker-compose run --rm django python manage.py migrate

make-and-apply-migrations: makemigrations migrate

bash:
	bash src/frontend/scripts/dock.sh

.PHONY: all build up down flush fclean clean re makemigrations migrate inspect clean_db make-migrations-apply makemigrations migrate make-and-apply-migrations

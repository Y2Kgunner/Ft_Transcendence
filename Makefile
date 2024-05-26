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

## WARNING: This will delete all data in the database
flush:
	docker-compose run django python manage.py flush

makemigrations:
	cd $(SRC_DIR) && docker-compose run --rm django python manage.py makemigrations

migrate:
	cd $(SRC_DIR) && docker-compose run --rm django python manage.py migrate

make-and-apply-migrations: makemigrations migrate

inspect:
	docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgres

clean_db:
	cd $(SRC_DIR) && docker-compose down -v
	docker volume rm $(docker volume ls -q --filter name=src_postgres_data) || true

bash:
	bash dock.sh

.PHONY: all build up down flush fclean clean re makemigrations migrate inspect clean_db make-migrations-apply makemigrations migrate make-and-apply-migrations

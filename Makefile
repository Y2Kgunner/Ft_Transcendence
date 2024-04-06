all: build up make-and-apply-migrations

SRC_DIR=src

build:
	cd $(SRC_DIR) && docker-compose build --no-cache
	
up:
	cd $(SRC_DIR) && docker-compose up -d

down:
	cd $(SRC_DIR) && docker-compose down

re: down build up make-and-apply-migrations

restart: down up

clean:
	cd $(SRC_DIR) && docker-compose down --rmi all

fclean: clean
	cd $(SRC_DIR) && docker volume rm $$(docker volume ls -q)

flush:
	docker-compose run django python manage.py flush --no-input

makemigrations:
	cd $(SRC_DIR) && docker-compose exec django python manage.py makemigrations
migrate:
	cd $(SRC_DIR) && docker-compose exec django python manage.py migrate
	
make-and-apply-migrations: makemigrations migrate

inspect:
	docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgres

clean_db:
	cd $(SRC_DIR) && docker-compose down -v
	docker volume rm $(docker volume ls -q --filter name=src_postgres_data) || true

.PHONY: all build up down flush fclean clean re makemigrations migrate inspect clean_db make-migrations-apply makemigrations migrate make-and-apply-migrations

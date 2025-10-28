SHELL := /bin/bash

.PHONY: up down logs migrate superuser seed test lint fmt shell makemigrations

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f api

migrate:
	docker compose run --rm api python manage.py migrate

makemigrations:
	docker compose run --rm api python manage.py makemigrations

superuser:
	docker compose run --rm api python manage.py createsuperuser

seed:
	docker compose run --rm api python manage.py seed_datos

test:
	docker compose run --rm api pytest --cov=apps --cov-report=term-missing

lint:
	ruff check filiales_django && black --check filiales_django && isort --check-only --profile black filiales_django

fmt:
	ruff check filiales_django --fix && black filiales_django && isort --profile black filiales_django

shell:
	docker compose run --rm api python manage.py shell

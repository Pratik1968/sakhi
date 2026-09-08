# Sakhi — setup & run tasks. Run `make` or `make help` for the list.
# App = Expo/React Native (repo root). Server = NestJS backend (./server).

SERVER := server
COMPOSE := docker compose

.DEFAULT_GOAL := help

## ---- Meta ----

.PHONY: help
help: ## Show this help
	@echo "Sakhi — available targets:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

## ---- One-shot setup ----

.PHONY: setup
setup: install server-setup ## Install everything and prepare the database (app + backend)
	@echo "✅ Setup complete. Run 'make server-dev' and 'make app' (or 'make docker-up')."

.PHONY: install
install: ## Install app (Expo) dependencies
	npm install

.PHONY: server-install
server-install: ## Install backend dependencies
	cd $(SERVER) && npm install

.PHONY: server-setup
server-setup: server-install db-generate db-migrate db-seed ## Install backend deps + generate client + migrate + seed
	@echo "✅ Backend ready. Login: meera@sakhi.app / password123"

## ---- Database (local, non-Docker) ----

.PHONY: db-generate
db-generate: ## Generate the Prisma client
	cd $(SERVER) && npm run prisma:generate

.PHONY: db-migrate
db-migrate: ## Apply database migrations (dev)
	cd $(SERVER) && npx prisma migrate deploy

.PHONY: db-seed
db-seed: ## Seed demo data (guardians, sample SOS)
	cd $(SERVER) && npm run db:seed

.PHONY: db-reset
db-reset: ## Drop and recreate the local database, then reseed
	cd $(SERVER) && npm run db:reset

## ---- Run (local, non-Docker) ----

.PHONY: server-dev
server-dev: ## Run the backend in watch mode (http://localhost:4000/api)
	cd $(SERVER) && npm run start:dev

.PHONY: server-build
server-build: ## Compile the backend
	cd $(SERVER) && npm run build

.PHONY: app
app: ## Start the Expo dev server
	npx expo start

.PHONY: web
web: ## Start the app in a web browser
	npx expo start --web

.PHONY: ios
ios: ## Start the app in the iOS simulator
	npx expo start --ios

.PHONY: android
android: ## Start the app in the Android emulator
	npx expo start --android

## ---- Quality ----

.PHONY: lint
lint: ## Lint the app
	npx expo lint

.PHONY: typecheck
typecheck: ## Type-check the app and the backend
	npx tsc --noEmit
	cd $(SERVER) && npm run build

## ---- Docker (backend) ----

.PHONY: docker-build
docker-build: ## Build the backend image
	$(COMPOSE) build

.PHONY: docker-up
docker-up: ## Build (if needed) and start the backend in the background
	$(COMPOSE) up -d --build
	@echo "✅ API on http://localhost:4000/api  (seeded: meera@sakhi.app / password123)"

.PHONY: docker-down
docker-down: ## Stop the backend container
	$(COMPOSE) down

.PHONY: docker-logs
docker-logs: ## Tail backend logs
	$(COMPOSE) logs -f api

.PHONY: docker-seed
docker-seed: ## Seed demo data inside the running container
	$(COMPOSE) exec api node prisma/seed.js

.PHONY: docker-shell
docker-shell: ## Open a shell in the running backend container
	$(COMPOSE) exec api sh

.PHONY: docker-reset
docker-reset: ## Wipe the backend volume (db + uploads) and restart fresh
	$(COMPOSE) down -v
	$(COMPOSE) up -d --build

## ---- Cleanup ----

.PHONY: clean
clean: ## Remove build artifacts and local databases
	rm -rf $(SERVER)/dist $(SERVER)/prisma/dev.db $(SERVER)/prisma/dev.db-journal
	rm -rf .expo dist-web
	@echo "🧹 Cleaned build artifacts."

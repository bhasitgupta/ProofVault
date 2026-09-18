.PHONY: help install seed test redteam build run-backend run-frontend clean

help:
	@echo "SDMS Build & Management Automation"
	@echo "  make install      - Install backend and frontend dependencies"
	@echo "  make seed         - Seed test users, cases, and synthetic corpus"
	@echo "  make test         - Run full pytest suite (17 tests)"
	@echo "  make redteam      - Run adversarial red-team test suite"
	@echo "  make build        - Compile and build frontend production assets"
	@echo "  make run-backend  - Start FastAPI application server"
	@echo "  make run-frontend - Start Vite frontend development server"
	@echo "  make clean        - Reset demo state and remove temporary DBs"

install:
	pip install --upgrade pip
	cd frontend && npm install

seed:
	python3 scripts/seed.py
	python3 scripts/generate_corpus.py

test:
	cd backend && python3 -m pytest tests/ -v

redteam:
	python3 scripts/redteam.py

build:
	cd frontend && npm run build
	cd ledger-gateway && npm run build
	cd chaincode/dochash && npm run build
	cd chaincode/access && npm run build

run-backend:
	cd backend && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

run-frontend:
	cd frontend && npm run dev

clean:
	bash scripts/reset_demo.sh

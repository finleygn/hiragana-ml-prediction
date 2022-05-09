.PHONY: scrape train api

RUN_CLR=\033[32;01m
RST_CLR=\033[0m

include .env
export $(shell sed 's/=.*//' .env)

export DATA_DIR = $(shell cd data && pwd)

setup:
	@echo "[${RUN_CLR}Running Setup${RST_CLR}]"
	@echo "- ${RUN_CLR}Model${RST_CLR}"
	@$(MAKE) -C apps/model setup
	@echo "- ${RUN_CLR}API${RST_CLR}"
	@$(MAKE) -C apps/api setup

scrape:
	@echo "[${RUN_CLR}Running Scraper${RST_CLR}]"
	@$(MAKE) -C apps/scraper run

train:
	@echo "[${RUN_CLR}Running Model Training${RST_CLR}]"
	@$(MAKE) -C apps/model train

api:
	@echo "[${RUN_CLR}Starting API${RST_CLR}]"
	@$(MAKE) -C apps/api start

client:
	@echo "[${RUN_CLR}Starting Client${RST_CLR}]"
	@$(MAKE) -C apps/client start
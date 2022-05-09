.PHONY: start
.DEFAULT_GOAL: start

setup:
	pipenv install

start:
	FLASK_APP=main pipenv run flask run -p $(API_PORT)

.PHONY: build

build:
	sam build

deploy-infra:
	sam deploy --guided

deploy-site:
	aws s3 sync ./frontend s3://maca-cloud-resume-challenge-v3-us-east-1

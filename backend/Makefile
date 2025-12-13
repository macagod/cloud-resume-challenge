build-VisitorCountFunction:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -tags lambda.norpc -o bootstrap main.go
	cp ./bootstrap $(ARTIFACTS_DIR)/.

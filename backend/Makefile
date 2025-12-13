build-VisitorCountFunction:
	powershell -Command "$$env:CGO_ENABLED=0; $$env:GOOS='linux'; $$env:GOARCH='amd64'; go build -tags lambda.norpc -o bootstrap main.go"
	powershell -Command "Copy-Item ./bootstrap $(ARTIFACTS_DIR)/"

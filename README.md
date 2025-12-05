# Cloud Resume Challenge

A serverless portfolio website built on AWS, featuring a dynamic visitor counter and modern CI/CD practices. This project demonstrates cloud architecture, infrastructure as code, and full-stack development skills.

**Live Site**: https://raphael-lawrence.cloud

---

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [CI/CD Pipelines](#cicd-pipelines)
- [Challenges & Solutions](#challenges--solutions)
- [Future Improvements](#future-improvements)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)

---


## Architecture

<img width="922" height="721" alt="CloudResumeChallenge_Architecture" src="https://github.com/user-attachments/assets/2b000605-c0d0-411e-98ea-377466206a13" />

### Key Components

- **Frontend**: Static HTML/CSS/JS hosted on S3
- **CDN**: CloudFront distribution with custom domain and SSL
- **Backend**: Go Lambda function for visitor counter
- **Database**: DynamoDB for persistent storage
- **IaC**: AWS SAM (Serverless Application Model)
- **CI/CD**: GitHub Actions for automated testing and deployment

---

## Features

- Modern, responsive design with mobile-first approach
- Real-time visitor counter with ordinal suffixes (1st, 2nd, 3rd...)
- HTTPS enabled with custom domain and SSL/TLS certificate
- Serverless architecture with zero server management
- Automated testing with 100% coverage for Lambda function
- Separate CI/CD pipelines for frontend and backend
- Global content delivery via CloudFront CDN

---

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive design with CSS Grid and Flexbox
- Hosted on AWS S3 + CloudFront

### Backend
- **Language**: Go 1.21
- **Runtime**: AWS Lambda (provided.al2)
- **API**: API Gateway (REST)
- **Database**: DynamoDB
- **IaC**: AWS SAM

### DevOps
- **CI/CD**: GitHub Actions
- **Testing**: Go testing framework
- **Build**: SAM CLI, Make
- **Version Control**: Git + GitHub

---

## Project Structure

```
cloud-resume-challenge/
├── frontend/                # Static website files
│   ├── index.html          # Main portfolio page
│   ├── styles.css          # Styling
│   ├── script.js           # Frontend logic + API calls
│   ├── error.html          # Custom error page
│   ├── background.svg      # Background graphic
│   ├── assets/             # Images, icons
│   ├── certificates/       # Certificate images
│   └── favicon/            # Favicon assets
│
├── backend/                # Lambda function (Go)
│   ├── main.go             # Lambda handler
│   ├── main_test.go        # Unit tests
│   ├── go.mod              # Go dependencies
│   ├── go.sum              # Dependency checksums
│   ├── coverage            # Test coverage report
│   └── Makefile            # Build configuration
│
├── .github/
│   └── workflows/
│       ├── frontend.yml    # Frontend CI/CD pipeline
│       └── main.yml        # Backend CI/CD pipeline
│
├── template.yaml           # SAM template (IaC)
├── samconfig.toml          # SAM deployment config
├── Makefile                # Project-level commands
├── CloudResumeChallenge_Architecture.png # Architecture diagram
└── README.md               # This file
```

---

## Getting Started

### Prerequisites

- [AWS Account](https://aws.amazon.com/)
- [AWS CLI](https://aws.amazon.com/cli/) configured with credentials
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- [Go 1.21+](https://golang.org/dl/)
- [Make](https://www.gnu.org/software/make/) (optional, for convenience)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/macagod/cloud-resume-challenge.git
   cd cloud-resume-challenge
   ```

2. **Install Go dependencies**
   ```bash
   cd backend
   go mod download
   cd ..
   ```

3. **Configure AWS credentials**
   ```bash
   aws configure
   ```

---

## Development

### Running Tests

```bash
# Run backend tests
cd backend
go test -v ./...

# Run tests with coverage
go test -v -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### Building Locally

```bash
# Build the Lambda function
sam build

# Validate SAM template
sam validate
```

### Local Testing (Optional)

```bash
# Start local API Gateway
sam local start-api

# Invoke function locally
sam local invoke VisitorCountFunction
```

### Frontend Development

Simply open `frontend/index.html` in your browser, or use a local server:

```bash
# Python 3
cd frontend
python -m http.server 8000

# Node.js (http-server)
npx http-server frontend -p 8000
```

---

## Deployment

### First-Time Deployment

1. **Create ACM Certificate** (in `us-east-1` for CloudFront)
   ```bash
   aws acm request-certificate \
     --domain-name yourdomain.com \
     --validation-method DNS \
     --region us-east-1
   ```

2. **Create Route53 Hosted Zone**
   ```bash
   aws route53 create-hosted-zone \
     --name yourdomain.com \
     --caller-reference $(date +%s)
   ```

3. **Deploy Infrastructure**
   ```bash
   sam build
   sam deploy --guided
   ```

   You'll be prompted for:
   - Stack name
   - AWS Region
   - Domain name
   - Certificate ARN
   - Hosted Zone ID

4. **Deploy Frontend**
   ```bash
   make deploy-site
   # Or manually:
   aws s3 sync ./frontend s3://your-bucket-name
   ```

### Subsequent Deployments

```bash
# Deploy infrastructure changes
make build
sam deploy

# Deploy frontend changes (or use CI/CD)
make deploy-site
```

---

## CI/CD Pipelines

This project uses two separate GitHub Actions workflows to ensure frontend and backend deployments are isolated and don't interfere with each other.

### Frontend Pipeline (`.github/workflows/frontend.yml`)

**Triggers on**:
- Changes to `frontend/**` files
- Push to `main` or pull requests

**Jobs**:
1. **Validate**: Checks HTML syntax and file structure
2. **Deploy** (main branch only):
   - Syncs files to S3 bucket
   - Sets appropriate cache control headers
   - Invalidates CloudFront cache for immediate updates

**Deployment Time**: ~1-2 minutes

### Backend Pipeline (`.github/workflows/main.yml`)

**Triggers on**:
- Changes to `backend/**` files
- Changes to `template.yaml`
- Changes to the workflow file itself

**Jobs**:
1. **Test**: Runs Go unit tests with coverage reporting
2. **Build**: Compiles Lambda binary for Linux/AMD64
3. **Lint**: Runs golangci-lint for code quality
4. **Deploy** (main branch only):
   - Builds SAM application
   - Deploys infrastructure updates
   - Updates Lambda function

**Deployment Time**: ~3-5 minutes

### Required GitHub Secrets

Add these in your repository settings (Settings → Secrets and variables → Actions):

- `AWS_ACCESS_KEY_ID` - AWS access key for deployment
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for deployment
- `CERTIFICATE_ARN` - ACM certificate ARN for HTTPS
- `HOSTED_ZONE_ID` - Route53 hosted zone ID
- `CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID (optional, for cache invalidation)

### Benefits of Separate Pipelines

- **Faster Deployments**: Frontend changes deploy in seconds without rebuilding backend
- **Reduced Risk**: Backend infrastructure changes don't affect frontend deployments
- **Clear Separation**: Easy to see which part of the application changed
- **Independent Rollbacks**: Can rollback frontend or backend independently

---

## Challenges & Solutions

Throughout this project, we encountered several technical challenges that provided valuable learning experiences:

### 1. Lambda Runtime Error: GLIBC Version Mismatch

**Challenge**: After initial deployment, the Lambda function failed to initialize with:
```
/var/task/main: /lib64/libc.so.6: version 'GLIBC_2.32' not found
Runtime.ExitError
```

**Root Cause**: The Go binary was dynamically linked against a newer version of GLIBC (2.32/2.34) from the build environment, but the deprecated `go1.x` runtime (Amazon Linux 1) only provided GLIBC 2.26.

**Solution**:
- Migrated from deprecated `go1.x` runtime to `provided.al2` (Amazon Linux 2)
- Enforced static linking by setting `CGO_ENABLED=0` in build process
- Changed handler from `main` to `bootstrap` (required for custom runtimes)
- Created `Makefile` in backend directory for SAM build compatibility

**Key Learnings**:
- Always use `CGO_ENABLED=0` for Lambda functions to ensure portability
- Stay current with AWS runtime deprecations
- Static binaries eliminate system library dependencies

### 2. CORS Configuration

**Challenge**: Initial API calls from the frontend were blocked by CORS policy.

**Solution**:
- Configured CORS in API Gateway via SAM template
- Added proper CORS headers in Lambda response:
  ```go
  Headers: map[string]string{
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
  }
  ```

**Key Learnings**:
- CORS must be configured at both API Gateway and Lambda levels
- Wildcard (`*`) is acceptable for public APIs but should be restricted in production

### 3. Windows Build Environment Compatibility

**Challenge**: `sam build` failed on Windows due to missing `make` utility.

**Solution**:
- Documented PowerShell alternative for Windows developers
- GitHub Actions (Linux) handles production builds
- Added clear troubleshooting section in README

**Key Learnings**:
- Cross-platform compatibility requires documentation
- CI/CD ensures consistent builds regardless of local environment

---

## Future Improvements

### Monitoring & Observability

1. **CloudWatch Alarms**
   - Set up email alerts when Lambda errors occur
   - Monitor API Gateway 4xx/5xx error rates
   - Track DynamoDB throttling events

2. **CloudWatch Dashboard**
   - Create a single-page view of key metrics (requests, errors, latency)
   - Add widgets for Lambda invocations and DynamoDB read/write units

3. **Structured Logging**
   - Add JSON-formatted logs to Lambda function
   - Include request IDs for easier debugging

### Cost Optimization

1. **S3 Lifecycle Policies**
   - Automatically delete old CloudWatch logs after 30 days
   - Move old S3 objects to cheaper storage classes
   - **Estimated Savings**: 50-70% on log storage

2. **DynamoDB On-Demand Review**
   - Monitor actual read/write patterns
   - Switch to provisioned capacity if traffic is predictable
   - **Estimated Savings**: Up to 50% if traffic is consistent

3. **CloudFront Cache Optimization** ✅ IMPLEMENTED
   - Configured 24-hour default TTL and 7-day maximum TTL
   - Reduces S3 origin requests by 90-99%
   - Faster content delivery from edge locations
   - **Current Settings**: `DefaultTTL: 86400` (24h), `MaxTTL: 604800` (7d)
   - **Estimated Savings**: Significant reduction in S3 request costs

4. **AWS Budgets**
   - Set up budget alerts at $5, $10, $20 thresholds
   - Get email notifications before overspending

### Performance Enhancements

1. **Image Optimization**
   - Convert images to WebP format (smaller file sizes)
   - Use responsive images with `srcset`
   - **Impact**: 30-50% faster page loads

2. **Lambda Cold Start Reduction**
   - Keep Lambda function code small
   - Consider provisioned concurrency for critical functions
   - **Impact**: Reduce first-request latency from 1s to 100ms

3. **API Response Caching**
   - Cache visitor count for 5 seconds in Lambda
   - Reduce DynamoDB reads by 95%+
   - **Impact**: Lower costs and faster responses

4. **Minify Assets**
   - Minify CSS and JavaScript files
   - Remove comments and whitespace
   - **Impact**: 20-30% smaller file sizes

### Security Improvements

1. **API Rate Limiting**
   - Add usage plans to API Gateway
   - Prevent abuse and unexpected costs

2. **CORS Restriction**
   - Replace wildcard `*` with specific domain
   - Only allow requests from your website

3. **CloudWatch Log Encryption**
   - Enable encryption for Lambda logs
   - Use AWS KMS for encryption keys

---

## Troubleshooting

### Common Issues

#### 1. GLIBC Version Mismatch

**Error**: `/var/task/main: /lib64/libc.so.6: version 'GLIBC_2.32' not found`

**Solution**: Ensure `CGO_ENABLED=0` is set during build (already configured in workflow).

#### 2. CORS Errors

**Error**: `Access to fetch at '...' has been blocked by CORS policy`

**Solution**: Verify API Gateway CORS settings in `template.yaml` and Lambda response headers.

#### 3. SAM Build Fails on Windows

**Error**: `make: command not found`

**Solution**: Use PowerShell to build manually:
```powershell
cd backend
$env:CGO_ENABLED="0"; $env:GOOS="linux"; $env:GOARCH="amd64"
go build -tags lambda.norpc -o bootstrap main.go
```

#### 4. CloudFront Not Serving Updated Content

**Solution**: Invalidate CloudFront cache:
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

#### 5. Frontend Pipeline Not Triggering

**Solution**: Ensure `CLOUDFRONT_DISTRIBUTION_ID` secret is set in GitHub repository settings. The pipeline will skip cache invalidation if this secret is missing.

---

## Additional Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [AWS Lambda Go SDK](https://github.com/aws/aws-lambda-go)
- [Cloud Resume Challenge](https://cloudresumechallenge.dev/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Go Best Practices](https://golang.org/doc/effective_go)

---

## Author

**Raphael Lawrence**

- Website: [raphael-lawrence.cloud](https://raphael-lawrence.cloud)
- GitHub: [@macagod](https://github.com/macagod)
- LinkedIn: [Raphael Lawrence](https://linkedin.com/in/raphael-lawrence-macadaeg-977306248)

---

## Acknowledgments

- Inspired by the [Cloud Resume Challenge](https://cloudresumechallenge.dev/) by Forrest Brazeal
- Built with dedication and cloud-native best practices

---

**If you found this project helpful, please consider giving it a star!**






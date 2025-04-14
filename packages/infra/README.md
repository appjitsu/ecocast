# Ecocast Infrastructure (`packages/infra`)

This package contains the AWS Cloud Development Kit (CDK) code responsible for defining and provisioning the cloud infrastructure required for the Ecocast application.

**Note:** The `src/stack.ts` file contains the definitions for all resources. Some resource blocks (e.g., Database, Frontend, Migrations) might be commented out by default in the provided source. Uncomment the relevant sections as needed for your deployment target.

## Overview

This CDK stack provisions the following AWS resources:

- **Networking:**
  - VPC (Virtual Private Cloud) with public and private subnets across 2 Availability Zones.
  - NAT Gateway for outbound internet access from private subnets.
- **Database:**
  - RDS PostgreSQL instance (T3.micro) in private subnets.
  - Secrets Manager secret to automatically manage and store database credentials.
  - Security Group allowing access only from the ECS service.
- **Backend (API - Nest.js):**
  - ECR (Elastic Container Registry) repository (`ecocast-api`) to store Docker images.
  - ECS (Elastic Container Service) Cluster (`ecocast-cluster`).
  - ECS Fargate Task Definition specifying CPU/memory, container image (from ECR), port mappings, logging (CloudWatch), and environment variables/secrets injection.
  - ECS Fargate Service (`ecocast-api-service`) to run the backend container task, placed in private subnets.
  - Application Load Balancer (ALB) in public subnets to expose the backend service.
  - Security Groups for ALB and ECS service.
  - IAM Roles for ECS Task Execution (pulling images, logging) and Task Role (accessing Secrets Manager).
  - Secrets Manager secret for JWT token.
- **Frontend (Web - Next.js Static Export):**
  - S3 Bucket configured for static website hosting (private, access via CloudFront).
  - CloudFront Distribution with OAI (Origin Access Identity) to serve frontend assets securely over HTTPS from the S3 bucket.
- **CI/CD:**
  - IAM Role (`GitHubActionsRole-Ecocast`) configured for GitHub Actions OIDC, allowing secure deployments from the specific GitHub repository (`your-github-org/your-github-repo`) without static AWS keys.

## Prerequisites

1. **AWS Account:** You need an AWS account.
2. **AWS CLI:** The AWS Command Line Interface must be installed and configured. Run `aws configure` to set up your credentials (Access Key ID, Secret Access Key) and default region.

   ```bash
   # Install if needed (Linux/WSL2 example)
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   rm -rf aws awscliv2.zip

   # Configure credentials
   aws configure
   ```

3. **Node.js & pnpm:** Node.js (v18 or later) and pnpm (v8.15.4 or compatible) are required, managed by the root project setup.
4. **CDK Bootstrap:** If this is your first time using CDK in the target AWS account and region, you need to bootstrap it:

   ```bash
   # Run from within packages/infra
   pnpm cdk bootstrap
   ```

## Setup

1. **Install Dependencies:** Run `pnpm install` from the root of the monorepo.
2. **Update Placeholders:** Before deploying, **you MUST** update the following placeholders in `packages/infra/src/stack.ts`:
   - `githubOrg`: Replace `'your-github-org'` with your actual GitHub username or organization name.
   - `githubRepo`: Replace `'your-github-repo'` with the name of this GitHub repository.
   - Verify the `githubOidcProviderArn` matches the OIDC provider ARN in your AWS IAM settings.

## Deployment Commands

All CDK commands should be run from within the `packages/infra` directory.

- **Synthesize CloudFormation Template:** (Optional) See the CloudFormation template CDK will generate.

  ```bash
  pnpm cdk synth EcocastStack
  ```

- **Show Differences:** (Optional) Compare the defined stack with the deployed stack (if any).

  ```bash
  pnpm cdk diff EcocastStack
  ```

- **Deploy Stack:** Provision or update the infrastructure in your AWS account.

  ```bash
  pnpm cdk deploy EcocastStack
  ```

  CDK will show you the changes and prompt for confirmation before applying them.

  - To deploy without the interactive prompt: `pnpm cdk deploy EcocastStack --require-approval never`

## Stack Outputs & GitHub Secrets Configuration

After a successful deployment (`cdk deploy`), CDK will print the stack outputs to the terminal. You **must** configure these as secrets in your GitHub repository (**Settings -> Secrets and variables -> Actions -> New repository secret**) for the deployment workflow (`.github/workflows/ci.yml`) to function.

**Required Secrets:**

- `AWS_REGION`: Your target AWS region (e.g., `us-east-1`).
- `AWS_ROLE_TO_ASSUME`: Value from `GithubActionsRoleArn` output.
- `ECR_REPOSITORY_URI`: Value from `EcrRepositoryUri` output.
- `ECS_CLUSTER_NAME`: Value from `EcsClusterName` output.
- `ECS_SERVICE_NAME`: Value from `EcsServiceName` output.
- `ECS_TASK_DEFINITION_ARN`: Value from `EcsTaskDefinitionArn` output (ARN of the _API service_ task definition).
- `ECS_MIGRATION_TASK_DEFINITION_ARN`: Value from `EcsMigrationTaskDefinitionArn` output.
- `PRIVATE_SUBNET_IDS`: Value from `PrivateSubnetIds` output (comma-separated string).
- `ECS_SECURITY_GROUP_ID`: Value from `EcsSecurityGroupId` output.
- `FRONTEND_S3_BUCKET_NAME`: Value from `FrontendBucketName` output.
- `FRONTEND_CLOUDFRONT_DISTRIBUTION_ID`: Value from `FrontendDistributionId` output.
- `BACKEND_SERVICE_URL`: Value from `BackendServiceUrl` output.

You can also retrieve stack outputs later using:

- **AWS CLI:**

  ```bash
  aws cloudformation describe-stacks --stack-name EcocastStack --query "Stacks[0].Outputs" --output table
  ```

- **AWS Management Console:** Navigate to CloudFormation -> Stacks -> EcocastStack -> Outputs tab.

## Application Deployment Process (GitHub Actions)

Once the AWS infrastructure is deployed using CDK and the necessary GitHub secrets (derived from the Stack Outputs) are configured, the actual `web` and `api` applications are deployed automatically via the GitHub Actions workflow defined in `.github/workflows/ci.yml`. This workflow runs on every push to the `main` branch.

Here's a summary of the deployment steps within the workflow:

1. **Trigger:** Push to `main` branch.
2. **CI Checks:** Linting, type checking, and automated tests are run.
3. **Build:** Both `api` and `web` applications are built.
4. **Deploy Backend (`deploy-backend` job):**
   - Authenticates to AWS using OIDC (assuming the `GitHubActionsRole-Ecocast` role).
   - Builds the `apps/api` Docker image using `apps/api/Dockerfile`.
   - Tags the image with the Git commit SHA.
   - Pushes the image to the ECR repository (`EcocastStack.EcrRepositoryUri`).
   - **(Database Migration):**
     - Runs a **separate, short-lived ECS task** using a dedicated task definition (`EcocastStack.EcsMigrationTaskDefinitionArn`).
     - This task uses the same Docker image but overrides the command to run the TypeORM migration script (e.g., `pnpm db:migrate`).
     - It runs in the private subnets (`EcocastStack.PrivateSubnetIds`) with the appropriate security group (`EcocastStack.EcsSecurityGroupId`) to access the RDS database.
     - The workflow waits for this task to complete and checks its exit code. If the migration fails, the deployment stops.
   - **(API Service Update):**
     - Renders a new ECS Task Definition for the **API service** based on the existing one (`EcocastStack.EcsTaskDefinitionArn`), updating it to use the newly pushed image URI.
     - Updates the ECS Service (`EcocastStack.EcsServiceName`) to use the new API Task Definition, triggering a rolling deployment of the backend container.
5. **Deploy Frontend (`deploy-frontend` job):** (Runs after successful backend deployment)
   - Authenticates to AWS using OIDC.
   - Builds the static Next.js site (`apps/web`), injecting the backend URL (`EcocastStack.BackendServiceUrl` via `NEXT_PUBLIC_API_URL` environment variable) during the build.
   - Syncs the contents of the build output directory (`apps/web/out`) to the S3 bucket (`EcocastStack.FrontendBucketName`).
   - Creates a CloudFront invalidation for all paths (`/*`) on the distribution (`EcocastStack.FrontendDistributionId`) to clear the cache and serve the latest version. _(Note: CloudFront invalidations can take several minutes to propagate globally.)_

- **First Deployment Approval:** If you configured the "production" environment in GitHub with required reviewers, the first time the `deploy-backend` and `deploy-frontend` jobs run, they will pause and require manual approval in the GitHub Actions UI before proceeding.

## Database Migrations (TypeORM)

- **Process:** Migrations are handled automatically during the `deploy-backend` GitHub Actions job _before_ the main API service is updated.
- **Mechanism:** A dedicated ECS Fargate task (`MigrationTaskDefinition`) is run using the latest application code/image. This task executes the migration script defined in `apps/api/package.json` (e.g., `pnpm --filter @repo/api migration:run`) against the RDS database. Verify the exact command override in the Migration Task Definition within `src/stack.ts`.
- **Configuration:** Ensure your TypeORM `DataSource` in `apps/api` is configured to read connection details from environment variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`). These are injected into the migration task by CDK.
- **Safety:** The workflow waits for the migration task to complete and checks its status. If migrations fail, the deployment pipeline halts before updating the API service, preventing mismatches between code and schema.

## Destroying the Stack

To remove all resources created by this stack from your AWS account:

```bash
# Run from within packages/infra
pnpm cdk destroy EcocastStack
```

**Warning:** This will permanently delete the resources, including the RDS database and S3 bucket contents (as `removalPolicy` is set to `DESTROY` and `emptyOnDelete` is true for development). Be absolutely sure before running this command, especially in a production environment.

## Important Notes

- **Cost:** Be aware that the AWS resources provisioned by this stack will incur costs. Remember to destroy the stack when not needed, especially the RDS instance, NAT Gateway, and Load Balancer.
- **Security:** The current configuration uses default settings suitable for development. For production, review and harden security group rules, IAM permissions, RDS configurations (Multi-AZ, backups, deletion protection), and consider adding HTTPS to the ALB.
- **Placeholders:** Remember to update the GitHub organization and repository placeholders in `src/stack.ts` before deploying.
- **Application Configuration:** The Nest.js backend application (`apps/api`) **must** be configured to:
  - Read database credentials and the JWT secret from environment variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`).
  - Expose a `/health` endpoint for the ALB health checks to function correctly.
- **Dockerfile Dependencies:** If the `apps/api` application depends on other local packages within the `packages/*` directory, ensure the `apps/api/Dockerfile` is updated to copy the necessary source files for those dependencies before running `pnpm install` in the builder stage.

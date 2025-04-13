import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class EcocastStack extends cdk.Stack {
  // Outputs for other parts of the system
  public readonly dbSecretArn: cdk.CfnOutput;
  public readonly ecrRepositoryUri: cdk.CfnOutput;
  public readonly backendServiceUrl: cdk.CfnOutput;
  public readonly ecsClusterName: cdk.CfnOutput;
  public readonly ecsServiceName: cdk.CfnOutput;
  public readonly ecsTaskDefinitionArn: cdk.CfnOutput;
  public readonly jwtSecretArn: cdk.CfnOutput;
  public readonly frontendBucketName: cdk.CfnOutput;
  public readonly frontendDistributionId: cdk.CfnOutput;
  public readonly frontendDistributionDomainName: cdk.CfnOutput;
  public readonly githubActionsRoleArn: cdk.CfnOutput;
  public readonly ecsMigrationTaskDefinitionArn: cdk.CfnOutput;
  public readonly privateSubnetIds: cdk.CfnOutput;
  public readonly ecsSecurityGroupId: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // === VPC ===
    // Create a new VPC or use an existing one
    const vpc = new ec2.Vpc(this, 'EcocastVpc', {
      maxAzs: 2, // Default is all AZs in region
      natGateways: 1, // Create 1 NAT Gateway for outbound traffic from private subnets
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public-subnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private-subnet',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, // For RDS and potentially ECS tasks
        },
      ],
    });

    // === RDS PostgreSQL Database ===
    /* // --- Start DB Comment Out ---
    // Create a Security Group for the RDS instance
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc,
      description: 'Allow db connection from ECS Tasks',
      allowAllOutbound: true, // Allow outbound traffic
    });
    // We will add ingress rules later when we define the ECS service

    // Create database credentials using Secrets Manager
    const dbCredentialsSecret = new secretsmanager.Secret(
      this,
      'DbCredentialsSecret',
      {
        secretName: `${id}-rds-credentials`,
        generateSecretString: {
          secretStringTemplate: JSON.stringify({ username: 'postgres' }),
          excludePunctuation: true,
          includeSpace: false,
          generateStringKey: 'password',
        },
      },
    );

    // Create a JWT secret using Secrets Manager
    const jwtSecret = new secretsmanager.Secret(this, 'JwtSecret', {
      secretName: `${id}-jwt-secret`,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ JWT_SECRET: 'changeme' }), // Placeholder value
        generateStringKey: 'secretValue', // Key within the secret JSON
        passwordLength: 32, // Generate a strong random secret
        excludePunctuation: false,
      },
    });

    // Create the RDS PostgreSQL instance
    const dbInstance = new rds.DatabaseInstance(this, 'EcocastDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16,
      }),
      instanceType: ec2.InstanceType.of(
        // Choose an appropriate instance type
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO,
      ),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      credentials: rds.Credentials.fromSecret(dbCredentialsSecret), // Use credentials from Secrets Manager
      databaseName: 'ecocast_db',
      securityGroups: [dbSecurityGroup],
      multiAz: false, // Set to true for production for high availability
      allocatedStorage: 20, // Storage in GiB
      storageType: rds.StorageType.GP3,
      backupRetention: cdk.Duration.days(7), // Optional: configure backups
      deletionProtection: false, // Set to true for production
      removalPolicy: cdk.RemovalPolicy.DESTROY, // DESTROY for dev, RETAIN or SNAPSHOT for production
    });
    */ // --- End DB Comment Out ---

    // === ECR Repository ===
    const ecrRepository = new ecr.Repository(this, 'ApiRepository', {
      repositoryName: 'ecocast-api', // Name for your ECR repository
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Or RETAIN
      emptyOnDelete: true, // Replaces deprecated autoDeleteImages
    });

    // === ECS Fargate Service ===
    const cluster = new ecs.Cluster(this, 'EcsCluster', {
      vpc,
      clusterName: 'ecocast-cluster',
    });

    // Task Definition
    const taskExecutionRole = new iam.Role(this, 'TaskExecutionRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AmazonECSTaskExecutionRolePolicy',
        ),
      ],
    });

    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Role for ECS tasks to access other AWS services',
    });

    /* // --- Start DB Permissions Comment Out ---
    // Grant task role permission to read the DB secret
    dbCredentialsSecret.grantRead(taskRole);
    // Grant task role permission to read the JWT secret
    jwtSecret.grantRead(taskRole);
    */ // --- End DB Permissions Comment Out ---

    const logGroup = new logs.LogGroup(this, 'ApiLogGroup', {
      logGroupName: '/ecs/ecocast-api',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      'ApiTaskDefinition',
      {
        memoryLimitMiB: 512,
        cpu: 256,
        executionRole: taskExecutionRole,
        taskRole: taskRole,
        runtimePlatform: {
          operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
          cpuArchitecture: ecs.CpuArchitecture.X86_64, // Or ARM64 if your image is ARM
        },
      },
    );

    // Add the container to the task definition
    taskDefinition.addContainer('ApiContainer', {
      image: ecs.ContainerImage.fromEcrRepository(ecrRepository, 'latest'), // Placeholder tag, updated by pipeline
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'api', logGroup }),
      portMappings: [{ containerPort: 3000 }], // Assuming NestJS runs on 3000
      environment: {
        NODE_ENV: 'production',
        /* // --- Start DB Env Comment Out ---
        // Pass DB connection details that are not secret
        DB_HOST: dbInstance.dbInstanceEndpointAddress,
        DB_PORT: dbInstance.dbInstanceEndpointPort,
        DB_NAME: 'ecocast_db',
        */ // --- End DB Env Comment Out ---
      },
      /* // --- Start DB Secrets Comment Out ---
      secrets: {
        // Inject secret portions of the DB connection
        DB_USERNAME: ecs.Secret.fromSecretsManager(
          dbCredentialsSecret,
          'username',
        ),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(
          dbCredentialsSecret,
          'password',
        ),
        // Inject JWT Secret
        JWT_SECRET: ecs.Secret.fromSecretsManager(jwtSecret, 'JWT_SECRET'),
      },
      */ // --- End DB Secrets Comment Out ---
    });

    // Security Group for the ECS Service/ALB
    const serviceSecurityGroup = new ec2.SecurityGroup(
      this,
      'ServiceSecurityGroup',
      {
        vpc,
        description: 'Allow HTTP traffic to ECS Service',
        allowAllOutbound: true,
      },
    );
    serviceSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP traffic from anywhere',
    );
    // TODO: Consider adding HTTPS later with ACM Certificate

    /* // --- Start DB SG Rule Comment Out ---
    // Allow connection from the Service SG to the DB SG
    dbSecurityGroup.addIngressRule(
      serviceSecurityGroup,
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access from ECS Service',
    );
    */ // --- End DB SG Rule Comment Out ---

    // Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ApiAlb', {
      vpc,
      internetFacing: true, // Publicly accessible
      securityGroup: serviceSecurityGroup,
    });

    const listener = alb.addListener('HttpListener', {
      port: 80,
      open: false, // Let the security group control access
    });

    // Fargate Service
    const fargateService = new ecs.FargateService(this, 'ApiService', {
      cluster,
      taskDefinition,
      desiredCount: 1, // Start with one instance
      assignPublicIp: false, // Run tasks in private subnets
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [serviceSecurityGroup],
      serviceName: 'ecocast-api-service',
      circuitBreaker: {
        rollback: true, // Enable rollback on deployment failure
      },
    });

    // Connect ALB to Fargate Service
    listener.addTargets('ApiTargetGroup', {
      port: 80,
      targets: [fargateService],
      healthCheck: {
        path: '/health', // TODO: Ensure your NestJS app has a /health endpoint
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 2,
        port: 'traffic-port',
      },
      protocol: elbv2.ApplicationProtocol.HTTP,
    });

    // === S3 Bucket for Frontend ===
    /* // --- Start Frontend Comment Out ---
    const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: `ecocast-frontend-${this.account}-${this.region}`,
      publicReadAccess: false, // Access controlled by CloudFront OAI/OAC
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Or RETAIN
      autoDeleteObjects: true, // Delete objects when bucket is deleted
    });

    // === CloudFront Distribution ===
    // Use Origin Access Identity (OAI) to allow CloudFront to access the private S3 bucket
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      'OAI',
    );
    frontendBucket.grantRead(originAccessIdentity);

    const distribution = new cloudfront.Distribution(
      this,
      'FrontendDistribution',
      {
        defaultRootObject: 'index.html',
        defaultBehavior: {
          // Using S3Origin with OAI is the standard way
          origin: new origins.S3Origin(frontendBucket, {
            originAccessIdentity: originAccessIdentity,
          }),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
          compress: true,
        },
        // Optional: Add error responses to redirect 403/404 to index.html for SPA routing
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
            ttl: cdk.Duration.seconds(10),
          },
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
            ttl: cdk.Duration.seconds(10),
          },
        ],
        // Optional: Configure for custom domain name
        // domainNames: ['your-domain.com'],
        // certificate: acm.Certificate.fromCertificateArn(this, 'Cert', 'your-cert-arn'),
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use cheapest price class
      },
    );
    */ // --- End Frontend Comment Out ---

    // === IAM Role for GitHub Actions (OIDC) ===
    // !! Replace with your GitHub organization and repository name !!
    const githubOrg = 'appjitsu'; // e.g., 'my-company'
    const githubRepo = 'ecocast'; // e.g., 'ecocast'

    // !! Replace with the ARN of your existing GitHub OIDC Provider in IAM !!
    // You can find this in the AWS IAM console under Identity Providers
    // Or create one if it doesn't exist.
    const githubOidcProviderArn = `arn:aws:iam::${this.account}:oidc-provider/token.actions.githubusercontent.com`;
    const githubProvider =
      iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
        this,
        'GitHubOidcProvider',
        githubOidcProviderArn,
      );

    const githubActionsRole = new iam.Role(this, 'GitHubActionsRole', {
      roleName: 'GitHubActionsRole-Ecocast', // Optional: Define a specific role name
      assumedBy: new iam.FederatedPrincipal(
        githubProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            // Ensures only GitHub Actions can assume this role
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            // Scopes the role to your specific repository, main branch, and environment
            'token.actions.githubusercontent.com:sub': `repo:${githubOrg}/${githubRepo}:environment:production`,
            // Alternatively, you might restrict by ref only if needed for other branches/PRs
            // 'token.actions.githubusercontent.com:sub': `repo:${githubOrg}/${githubRepo}:ref:refs/heads/main`,
          },
        },
        'sts:AssumeRoleWithWebIdentity', // Action required for OIDC
      ),
      description:
        'Role assumed by GitHub Actions for deploying the Ecocast application',
    });

    // Define permissions for the GitHub Actions Role
    githubActionsRole.attachInlinePolicy(
      new iam.Policy(this, 'GitHubActionsDeployPolicy', {
        statements: [
          // ECR Permissions
          new iam.PolicyStatement({
            actions: ['ecr:GetAuthorizationToken'],
            resources: ['*'], // Required for GetAuthorizationToken
          }),
          new iam.PolicyStatement({
            actions: [
              'ecr:BatchCheckLayerAvailability',
              'ecr:InitiateLayerUpload',
              'ecr:UploadLayerPart',
              'ecr:CompleteLayerUpload',
              'ecr:PutImage',
            ],
            resources: [ecrRepository.repositoryArn],
          }),
          // ECS Permissions
          new iam.PolicyStatement({
            actions: [
              'ecs:DescribeServices',
              'ecs:DescribeTaskDefinition',
              'ecs:UpdateService',
              // Add 'ecs:RegisterTaskDefinition' if you want the pipeline to update the TD
              // Currently, the pipeline just updates the service to use the new image tag
            ],
            resources: [
              fargateService.serviceArn,
              taskDefinition.taskDefinitionArn,
            ],
          }),
          // IAM PassRole permission for ECS Task Role
          new iam.PolicyStatement({
            actions: ['iam:PassRole'],
            resources: [taskRole.roleArn, taskExecutionRole.roleArn], // Role passed to ECS Service/Task
            // Condition to limit PassRole to the specific ECS service if needed
            // conditions: {
            //     StringEquals: { 'iam:PassedToService': 'ecs-tasks.amazonaws.com' }
            // }
          }),
          /* // --- Start Frontend Permissions Comment Out ---
          // S3 Permissions for Frontend Deployment
          new iam.PolicyStatement({
            actions: [
              's3:PutObject',
              's3:GetObject',
              's3:ListBucket',
              's3:DeleteObject',
              's3:GetBucketLocation',
            ],
            resources: [
              frontendBucket.bucketArn, // This line will cause an error if uncommented while bucket is commented out
              `${frontendBucket.bucketArn}/*`, // This line will cause an error if uncommented while bucket is commented out
            ],
          }),
          // CloudFront Invalidation Permissions
          new iam.PolicyStatement({
            actions: ['cloudfront:CreateInvalidation'],
            resources: [
              `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`, // This line will cause an error if uncommented while distribution is commented out
            ],
          }),
          */ // --- End Frontend Permissions Comment Out ---
        ],
      }),
    );

    // === Migration Task Definition ===
    /* // --- Start Migration Task Comment Out ---
    const migrationTaskDefinition = new ecs.FargateTaskDefinition(
      this,
      'MigrationTaskDefinition',
      {
        memoryLimitMiB: 512, // Can potentially be smaller if migrations are lightweight
        cpu: 256,
        executionRole: taskExecutionRole,
        taskRole: taskRole,
        runtimePlatform: {
          operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
          cpuArchitecture: ecs.CpuArchitecture.X86_64,
        },
      },
    );
    migrationTaskDefinition.addContainer('ApiContainer', {
      // Use the same container name
      image: ecs.ContainerImage.fromEcrRepository(ecrRepository, 'latest'), // Base image, will be overridden
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'migration', logGroup }), // Separate log stream
      environment: {
        NODE_ENV: 'production',
        DB_HOST: dbInstance.dbInstanceEndpointAddress,
        DB_PORT: dbInstance.dbInstanceEndpointPort,
        DB_NAME: 'ecocast_db',
      },
      secrets: {
        DB_USERNAME: ecs.Secret.fromSecretsManager(
          dbCredentialsSecret,
          'username',
        ),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(
          dbCredentialsSecret,
          'password',
        ),
        JWT_SECRET: ecs.Secret.fromSecretsManager(jwtSecret, 'JWT_SECRET'),
      },
      command: ['pnpm', 'run', 'db:migrate'], // Override command to run migrations
      // No port mappings needed for migration task
    });
    */ // --- End Migration Task Comment Out ---

    // === Outputs ===
    /* // --- Start DB/JWT Outputs Comment Out ---
    this.dbSecretArn = new cdk.CfnOutput(this, 'DbSecretArn', {
      value: dbCredentialsSecret.secretArn,
      description:
        'ARN of the Secrets Manager secret containing DB credentials',
    });
    this.jwtSecretArn = new cdk.CfnOutput(this, 'JwtSecretArn', {
      value: jwtSecret.secretArn,
      description: 'ARN of the Secrets Manager secret containing JWT secret',
    });
    */ // --- End DB/JWT Outputs Comment Out ---
    this.ecrRepositoryUri = new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: ecrRepository.repositoryUri,
      description: 'URI of the ECR repository for the backend API',
    });

    this.backendServiceUrl = new cdk.CfnOutput(this, 'BackendServiceUrl', {
      value: `http://${alb.loadBalancerDnsName}`,
      description: 'URL of the backend API service load balancer',
    });
    this.ecsClusterName = new cdk.CfnOutput(this, 'EcsClusterName', {
      value: cluster.clusterName,
    });
    this.ecsServiceName = new cdk.CfnOutput(this, 'EcsServiceName', {
      value: fargateService.serviceName,
    });
    this.ecsTaskDefinitionArn = new cdk.CfnOutput(
      this,
      'EcsTaskDefinitionArn',
      { value: taskDefinition.taskDefinitionArn },
    );

    /* // --- Start Frontend Outputs Comment Out ---
    this.frontendBucketName = new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: frontendBucket.bucketName,
      description: 'Name of the S3 bucket for the frontend static assets',
    });
    this.frontendDistributionId = new cdk.CfnOutput(
      this,
      'FrontendDistributionId',
      {
        value: distribution.distributionId,
        description: 'ID of the CloudFront distribution for the frontend',
      },
    );
    this.frontendDistributionDomainName = new cdk.CfnOutput(
      this,
      'FrontendDistributionDomainName',
      {
        value: distribution.distributionDomainName,
        description:
          'Domain name of the CloudFront distribution for the frontend',
      },
    );
    */ // --- End Frontend Outputs Comment Out ---

    this.githubActionsRoleArn = new cdk.CfnOutput(
      this,
      'GitHubActionsRoleArn',
      {
        value: githubActionsRole.roleArn,
        description: 'ARN of the IAM Role for GitHub Actions OIDC',
      },
    );

    /* // --- Start Migration Output Comment Out ---
    this.ecsMigrationTaskDefinitionArn = new cdk.CfnOutput(
      this,
      'EcsMigrationTaskDefinitionArn',
      {
        value: migrationTaskDefinition.taskDefinitionArn, // This line will cause an error if uncommented
        description: 'ARN of the ECS Task Definition for running DB migrations',
      },
    );
    */ // --- End Migration Output Comment Out ---
    this.privateSubnetIds = new cdk.CfnOutput(this, 'PrivateSubnetIds', {
      value: vpc.privateSubnets.map((subnet) => subnet.subnetId).join(','),
      description: 'Comma-separated list of private subnet IDs for ECS tasks',
    });
    this.ecsSecurityGroupId = new cdk.CfnOutput(this, 'EcsSecurityGroupId', {
      value: serviceSecurityGroup.securityGroupId,
      description: 'ID of the Security Group used by ECS tasks/ALB',
    });
  }
}

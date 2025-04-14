import * as cdk from 'aws-cdk-lib';
// import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'; // Commented out
// import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'; // Commented out
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'; // Ensure this is uncommented or added
// import * as rds from 'aws-cdk-lib/aws-rds'; // Commented out
// import * as s3 from 'aws-cdk-lib/aws-s3'; // Commented out
// import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'; // Commented out
import { Construct } from 'constructs';

export class EcocastStack extends cdk.Stack {
  // Outputs for other parts of the system
  /* // --- Start DB/JWT Outputs Comment Out ---
  public readonly dbSecretArn: cdk.CfnOutput;
  */ // --- End DB/JWT Outputs Comment Out ---
  public readonly ecrRepositoryUri: cdk.CfnOutput;
  // --- Start Backend Service URL Output UNCOMMENT ---
  public readonly backendServiceUrl: cdk.CfnOutput;
  // --- End Backend Service URL Output UNCOMMENT ---
  public readonly ecsClusterName: cdk.CfnOutput;
  // --- Start ECS Service Name Output UNCOMMENT ---
  public readonly ecsServiceName: cdk.CfnOutput;
  // --- End ECS Service Name Output UNCOMMENT ---
  // --- Start ECS Task Definition ARN Output UNCOMMENT ---
  public readonly ecsTaskDefinitionArn: cdk.CfnOutput;
  // --- End ECS Task Definition ARN Output UNCOMMENT ---
  /* // --- Start DB/JWT Outputs Comment Out ---
  public readonly jwtSecretArn: cdk.CfnOutput;
  */ // --- End DB/JWT Outputs Comment Out ---
  /* // --- Start Frontend Outputs Comment Out ---
  public readonly frontendBucketName: cdk.CfnOutput;
  public readonly frontendDistributionId: cdk.CfnOutput;
  public readonly frontendDistributionDomainName: cdk.CfnOutput;
  */ // --- End Frontend Outputs Comment Out ---
  public readonly githubActionsRoleArn: cdk.CfnOutput;
  /* // --- Start Migration Output Comment Out ---
  public readonly ecsMigrationTaskDefinitionArn: cdk.CfnOutput;
  */ // --- End Migration Output Comment Out ---
  public readonly privateSubnetIds: cdk.CfnOutput;
  public readonly ecsSecurityGroupId: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // === VPC ===
    const vpc = new ec2.Vpc(this, 'EcocastVpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public-subnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private-subnet',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // === RDS PostgreSQL Database (Commented Out) ===
    /* // --- Start DB Comment Out ---
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', { vpc, description: 'DB SG' });
    const dbCredentialsSecret = new secretsmanager.Secret(this, 'DbCredentialsSecret', { secretName: `${id}-rds-credentials` });
    const jwtSecret = new secretsmanager.Secret(this, 'JwtSecret', { secretName: `${id}-jwt-secret` });
    const dbInstance = new rds.DatabaseInstance(this, 'EcocastDatabase', { engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_16 }), instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO), vpc, vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }, credentials: rds.Credentials.fromSecret(dbCredentialsSecret), databaseName: 'ecocast_db', securityGroups: [dbSecurityGroup], removalPolicy: cdk.RemovalPolicy.DESTROY });
    */ // --- End DB Comment Out ---

    // === ECR Repository ===
    const ecrRepository = new ecr.Repository(this, 'ApiRepository', {
      repositoryName: 'ecocast-api',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });

    // === ECS Cluster ===
    const cluster = new ecs.Cluster(this, 'EcsCluster', {
      vpc,
      clusterName: 'ecocast-cluster',
    });

    // === Task Definition Roles ===
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
      description: 'Role for ECS tasks',
    });

    // === Log Group ===
    const logGroup = new logs.LogGroup(this, 'ApiLogGroup', {
      logGroupName: '/ecs/ecocast-api',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // --- Import Secrets (Replace placeholder names with your actual secret names in AWS Secrets Manager) ---
    const dbUrlSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'DbUrlSecret',
      'ecocast/prod/db/url',
    ); // Replace 'ecocast/prod/db/url' with your secret name
    // const dbPasswordSecret = secretsmanager.Secret.fromSecretNameV2(this, 'DbPasswordSecret', 'ecocast/prod/db/password'); // Removed
    const jwtSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'JwtSecret',
      'ecocast/prod/jwt/secret',
    ); // Replace 'ecocast/prod/jwt/secret'
    const profileApiKeySecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'ProfileApiKeySecret',
      'ecocast/prod/api/profile_key',
    ); // Replace 'ecocast/prod/api/profile_key'
    const sentryDsnSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'SentryDsnSecret',
      'ecocast/prod/sentry/dsn',
    ); // Replace 'ecocast/prod/sentry/dsn'
    const newsApiKeySecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'NewsApiKeySecret',
      'ecocast/prod/api/news_key',
    ); // Replace 'ecocast/prod/api/news_key'
    const openaiApiKeySecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'OpenaiApiKeySecret',
      'ecocast/prod/api/openai_key',
    ); // Replace 'ecocast/prod/api/openai_key'
    const voiceApiKeySecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'VoiceApiKeySecret',
      'ecocast/prod/api/voice_key',
    ); // NEW - Replace 'ecocast/prod/api/voice_key'
    const internalApiKeySecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'InternalApiKeySecret',
      'ecocast/prod/api/internal_key',
    ); // NEW - Replace 'ecocast/prod/api/internal_key'
    const sessionSecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'SessionSecret',
      'ecocast/prod/session/secret',
    ); // NEW - Assuming SESSION_SECRET is sensitive - Replace
    // Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET if needed for production
    // const googleClientIdSecret = secretsmanager.Secret.fromSecretNameV2(this, 'GoogleClientIdSecret', 'ecocast/prod/google/client_id');
    // const googleClientSecretSecret = secretsmanager.Secret.fromSecretNameV2(this, 'GoogleClientSecretSecret', 'ecocast/prod/google/client_secret');

    // === API Task Definition (UNCOMMENTED) ===
    // --- Start Task Definition UNCOMMENT ---
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
          cpuArchitecture: ecs.CpuArchitecture.X86_64,
        },
      },
    );
    taskDefinition.addContainer('ApiContainer', {
      image: ecs.ContainerImage.fromEcrRepository(ecrRepository, 'latest'),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'api', logGroup }),
      portMappings: [{ containerPort: 4001 }],
      essential: true,
      environment: {
        NODE_ENV: 'production',
        PORT: '4001',
        JWT_TOKEN_AUDIENCE: 'YOUR_JWT_AUDIENCE',
        JWT_TOKEN_ISSUER: 'YOUR_JWT_ISSUER',
        JWT_ACCESS_TOKEN_TTL: '3600',
        JWT_REFRESH_TOKEN_TTL: '604800',
        API_URL: 'YOUR_PRODUCTION_API_URL',
        COOKIE_DOMAIN: 'YOUR_PRODUCTION_DOMAIN',
        CORS_ORIGIN: 'YOUR_PRODUCTION_FRONTEND_URL',
        DATABASE_SYNC: 'false',
      },
      secrets: {
        DATABASE_URL: ecs.Secret.fromSecretsManager(dbUrlSecret),
        JWT_SECRET: ecs.Secret.fromSecretsManager(jwtSecret),
        SESSION_SECRET: ecs.Secret.fromSecretsManager(sessionSecret),
        API_KEY: ecs.Secret.fromSecretsManager(profileApiKeySecret),
        SENTRY_DSN: ecs.Secret.fromSecretsManager(sentryDsnSecret),
        NEWS_API_KEY: ecs.Secret.fromSecretsManager(newsApiKeySecret),
        OPENAI_API_KEY: ecs.Secret.fromSecretsManager(openaiApiKeySecret),
        VOICE_API_KEY: ecs.Secret.fromSecretsManager(voiceApiKeySecret),
        API_KEY: ecs.Secret.fromSecretsManager(internalApiKeySecret),
      },
    });
    // --- End Task Definition UNCOMMENT ---

    // Grant the Task Execution Role permissions to read the secrets
    dbUrlSecret.grantRead(taskExecutionRole);
    jwtSecret.grantRead(taskExecutionRole);
    sessionSecret.grantRead(taskExecutionRole);
    profileApiKeySecret.grantRead(taskExecutionRole);
    sentryDsnSecret.grantRead(taskExecutionRole);
    newsApiKeySecret.grantRead(taskExecutionRole);
    openaiApiKeySecret.grantRead(taskExecutionRole);
    voiceApiKeySecret.grantRead(taskExecutionRole);
    internalApiKeySecret.grantRead(taskExecutionRole);
    // googleClientIdSecret?.grantRead(taskExecutionRole);
    // googleClientSecretSecret?.grantRead(taskExecutionRole);

    // === Security Group ===
    const serviceSecurityGroup = new ec2.SecurityGroup(
      this,
      'ServiceSecurityGroup',
      {
        vpc,
        description: 'Allow HTTP traffic from ALB',
        allowAllOutbound: true,
      },
    );
    // UNCOMMENT ALB ingress rule
    serviceSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(), // Or potentially alb.loadBalancerSecurityGroup if defined earlier
      ec2.Port.tcp(80),
      'Allow HTTP traffic from anywhere (ALB)',
    );

    /* // --- Start DB SG Rule Comment Out ---
    // ... (DB SG Rule remains commented out)
    */ // --- End DB SG Rule Comment Out ---

    // === ALB, Listener, Service (UNCOMMENTED) ===
    // --- Start ALB/Listener/Service UNCOMMENT ---
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ApiAlb', {
      vpc,
      internetFacing: true,
      securityGroup: serviceSecurityGroup,
    });
    const listener = alb.addListener('HttpListener', { port: 80, open: false }); // open: false as SG controls access
    const fargateService = new ecs.FargateService(this, 'ApiService', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      assignPublicIp: false,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [serviceSecurityGroup],
      serviceName: 'ecocast-api-service',
      circuitBreaker: { rollback: true },
    }); // Re-enable default rollback for now
    listener.addTargets('ApiTargetGroup', {
      port: 80,
      targets: [fargateService],
      healthCheck: { path: '/health' },
      protocol: elbv2.ApplicationProtocol.HTTP,
    });
    // --- End ALB/Listener/Service UNCOMMENT ---

    // === Frontend Resources (Commented Out) ===
    /* // --- Start Frontend Comment Out ---
    const frontendBucket = new s3.Bucket(this, 'FrontendBucket', { bucketName: `ecocast-frontend-${this.account}-${this.region}`, blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, removalPolicy: cdk.RemovalPolicy.DESTROY, autoDeleteObjects: true });
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OAI');
    frontendBucket.grantRead(originAccessIdentity);
    const distribution = new cloudfront.Distribution(this, 'FrontendDistribution', { defaultRootObject: 'index.html', defaultBehavior: { origin: new origins.S3Origin(frontendBucket, { originAccessIdentity: originAccessIdentity }), viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS }, priceClass: cloudfront.PriceClass.PRICE_CLASS_100 });
    */ // --- End Frontend Comment Out ---

    // === IAM Role for GitHub Actions (OIDC) ===
    const githubOrg = 'appjitsu';
    const githubRepo = 'ecocast';
    const githubOidcProviderArn = `arn:aws:iam::${this.account}:oidc-provider/token.actions.githubusercontent.com`;
    const githubProvider =
      iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
        this,
        'GitHubOidcProvider',
        githubOidcProviderArn,
      );
    const githubActionsRole = new iam.Role(this, 'GitHubActionsRole', {
      roleName: 'GitHubActionsRole-Ecocast',
      assumedBy: new iam.FederatedPrincipal(
        githubProvider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub': `repo:${githubOrg}/${githubRepo}:environment:production`,
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
      description:
        'Role assumed by GitHub Actions for deploying the Ecocast application',
    });

    // === GitHub Actions Role Policy ===
    githubActionsRole.attachInlinePolicy(
      new iam.Policy(this, 'GitHubActionsDeployPolicy', {
        statements: [
          // ECR Permissions (Keep)
          new iam.PolicyStatement({
            actions: ['ecr:GetAuthorizationToken'],
            resources: ['*'],
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
          // ECS/IAM Permissions (UNCOMMENTED)
          // --- Start ECS/IAM Permissions UNCOMMENT ---
          new iam.PolicyStatement({
            actions: [
              'ecs:DescribeServices',
              'ecs:DescribeTaskDefinition',
              'ecs:UpdateService',
            ],
            resources: [
              fargateService.serviceArn,
              taskDefinition.taskDefinitionArn,
            ],
          }),
          new iam.PolicyStatement({
            actions: ['iam:PassRole'],
            resources: [taskRole.roleArn, taskExecutionRole.roleArn],
          }),
          // --- End ECS/IAM Permissions UNCOMMENT ---
          // Frontend Permissions (Commented Out)
          /* // --- Start Frontend Permissions Comment Out ---
          new iam.PolicyStatement({ actions: ['s3:PutObject', 's3:GetObject', 's3:ListBucket', 's3:DeleteObject', 's3:GetBucketLocation'], resources: [frontendBucket.bucketArn, `${frontendBucket.bucketArn}/*`] }),
          new iam.PolicyStatement({ actions: ['cloudfront:CreateInvalidation'], resources: [`arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`] }),
          */ // --- End Frontend Permissions Comment Out ---
        ],
      }),
    );

    // === Migration Task Definition (Commented Out) ===
    /* // --- Start Migration Task Comment Out ---
    const migrationTaskDefinition = new ecs.FargateTaskDefinition(this, 'MigrationTaskDefinition', { memoryLimitMiB: 512, cpu: 256, executionRole: taskExecutionRole, taskRole: taskRole });
    migrationTaskDefinition.addContainer('ApiContainer', { image: ecs.ContainerImage.fromEcrRepository(ecrRepository, 'latest'), logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'migration', logGroup }), command: ['pnpm', 'run', 'db:migrate'] });
    */ // --- End Migration Task Comment Out ---

    // === Outputs ===
    /* // --- Start DB/JWT Outputs Comment Out ---
    // ... (DB/JWT Outputs remain commented out)
    */ // --- End DB/JWT Outputs Comment Out ---
    this.ecrRepositoryUri = new cdk.CfnOutput(this, 'EcrRepositoryUri', {
      value: ecrRepository.repositoryUri,
      description: 'URI of ECR repo',
    });
    // --- Start Backend Service URL Output UNCOMMENT ---
    this.backendServiceUrl = new cdk.CfnOutput(this, 'BackendServiceUrl', {
      value: `http://${alb.loadBalancerDnsName}`,
      description: 'URL of the backend API service load balancer',
    });
    // --- End Backend Service URL Output UNCOMMENT ---
    this.ecsClusterName = new cdk.CfnOutput(this, 'EcsClusterName', {
      value: cluster.clusterName,
    });
    // --- Start ECS Service Name Output UNCOMMENT ---
    this.ecsServiceName = new cdk.CfnOutput(this, 'EcsServiceName', {
      value: fargateService.serviceName,
    });
    // --- End ECS Service Name Output UNCOMMENT ---
    // --- Start ECS Task Definition ARN Output UNCOMMENT ---
    this.ecsTaskDefinitionArn = new cdk.CfnOutput(
      this,
      'EcsTaskDefinitionArn',
      { value: taskDefinition.taskDefinitionArn },
    );
    // --- End ECS Task Definition ARN Output UNCOMMENT ---
    /* // --- Start Frontend Outputs Comment Out ---
    // ... (Frontend outputs remain commented out)
    */ // --- End Frontend Outputs Comment Out ---
    this.githubActionsRoleArn = new cdk.CfnOutput(
      this,
      'GitHubActionsRoleArn',
      {
        value: githubActionsRole.roleArn,
        description: 'ARN of GitHub Actions Role',
      },
    );
    /* // --- Start Migration Output Comment Out ---
    // ... (Migration output remains commented out)
    */ // --- End Migration Output Comment Out ---
    this.privateSubnetIds = new cdk.CfnOutput(this, 'PrivateSubnetIds', {
      value: vpc.privateSubnets.map((subnet) => subnet.subnetId).join(','),
      description: 'Private subnet IDs',
    });
    this.ecsSecurityGroupId = new cdk.CfnOutput(this, 'EcsSecurityGroupId', {
      value: serviceSecurityGroup.securityGroupId,
      description: 'ID of Service SG',
    });
  }
}

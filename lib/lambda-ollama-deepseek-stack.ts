import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecr from 'aws-cdk-lib/aws-ecr'
import { Construct } from 'constructs';
import * as ecr_assets from 'aws-cdk-lib/aws-ecr-assets';
import * as ecr_deployment from 'cdk-ecr-deployment';
// install the package by npm install deploy-time-build
// import { SociIndexBuild } from 'deploy-time-build';

export class LambdaOllamaDeepseekStack extends cdk.Stack {
  public readonly lambdaFunction: lambda.Function;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Lambda execution role with required permissions
    const lambdaRole = new iam.Role(this, 'LambdaExecutionRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    const ollamaRepo = new ecr.Repository(this, 'OllamaEcrRepo', {
      repositoryName: 'ollama-lambda',
      imageScanOnPush: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Use RETAIN for production
    });


    const appImageAsset = new ecr_assets.DockerImageAsset(this, 'OllamaImage', {
      directory: './lib',
      platform: ecr_assets.Platform.LINUX_ARM64,

    });


    // Deploy the Docker image to the ECR repository
    const imageDeployment = new ecr_deployment.ECRDeployment(this, 'DeployDockerImage', {
      src: new ecr_deployment.DockerImageName(appImageAsset.imageUri),
      dest: new ecr_deployment.DockerImageName(`${ollamaRepo.repositoryUri}:latest`), // Added tag
    });

    // // Create SOCI index after the image has been deployed
    // const sociIndexBuild = new SociIndexBuild(this, 'Index', {
    //   repository: ollamaRepo,
    //   imageTag: 'latest',
    // });

    // // Ensure SOCI index creation happens after image deployment
    // sociIndexBuild.node.addDependency(imageDeployment);

    this.lambdaFunction = new lambda.DockerImageFunction(this, 'ollama-lambda', {
      code: lambda.DockerImageCode.fromEcr(ollamaRepo,
        {
          tagOrDigest: 'latest',
        }
      ),
      functionName: 'ollama-lambda',
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.minutes(15),
      memorySize: 10240,
      ephemeralStorageSize: cdk.Size.mebibytes(8196),
      environment: {
        POWERTOOLS_SERVICE_NAME: 'ollama-lambda',
        LOG_LEVEL: 'DEBUG',
        MALLOC_ARENA_MAX: '2',
        OLLAMA_MODEL: 'deepseek-r1:1.5b',
        OLLAMA_HOST: '127.0.0.1',
        HOME: '/tmp',
        OLLAMA_MODELS: '/tmp',
        LD_LIBRARY_PATH: '/var/task/lib',
      },
      role: lambdaRole,

    });

    this.lambdaFunction.node.addDependency(imageDeployment);

    // Enable Function URL (No API Gateway Needed)
    const url = this.lambdaFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE, // Change to AWS_IAM for authentication
    }).url;

    //SnapStart Config
    //   ollamaLambda.addAlias("provisioned", {
    //   description: "Alias version for provisioned resources",
    //   provisionedConcurrentExecutions: 1
    // });
    // // Enable SnapStart
    // const cfnFunction = ollamaLambda.node.defaultChild as lambda.CfnFunction;
    // cfnFunction.addPropertyOverride("SnapStart", { ApplyOn: "PublishedVersions" });

    //cdk output for function url 
    new cdk.CfnOutput(this, 'FunctionUrl', {
      value: url,
      description: 'The URL of the Lambda Function',
      exportName: 'FunctionUrl',
    });

  }
}

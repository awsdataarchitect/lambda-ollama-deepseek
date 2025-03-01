# DeepSeek-R1 inference on AWS Lambda using Function URL (no API Gateway needed): An Experimental Approach for AI Prototyping

Full AWS-CDK code for LLM deployment on AWS Lambda-Docker Container.

For more details on how to deploy the infrastructure and the solution details, please refer to the Blog Post:
* [DeepSeek-R1 inference on AWS Lambda using Function URL (no API Gateway needed)](https://vivek-aws.medium.com/deepseek-r1-inference-on-aws-lambda-using-function-url-no-api-gateway-needed-4d4e4d183164).

Once deployed, get the Function URL from CDK outputs.

Run a test request (e.g.):

```bash
curl -X POST https://amnfnya7regz5vbtc5cguxpfbm0iyogj.lambda-url.us-east-1.on.aws/ \
     -d '{"prompt": "Explain quantum computing"}' \
     -H "Content-Type: application/json"
```

Expected Response:

```json
{
  "response": "Quantum computing is a type of computing that uses quantum bits..."
}
```

## Comparison: Deployment Options for DeepSeek-R1 on AWS

| **Service**                 | **Architecture Support** | **Memory Limits**               | **Storage Capacity**                               | **Execution Timeouts**                          | **Cost Model**                                                         | **Scaling Capabilities**                                                   | **Cold Start Impact**                           | **Infrastructure Management**          | **Model Updates**                             | **Integration Capabilities**                                                   | **Ideal Use Cases**                                                                 |
|-----------------------------|-------------------------|--------------------------------|--------------------------------------------------|-------------------------------------------------|------------------------------------------------------------------------|----------------------------------------------------------------------------------|------------------------------------------------|--------------------------------------|--------------------------------------------|----------------------------------------------------------------------------------|--------------------------------------------------------------------------------------|
| **AWS Lambda**              | x86_64, ARM64 (Graviton2) | 10GB max                      | Ephemeral /tmp (10GB max), EFS                   | 15 minutes maximum                              | Pay-per-invocation + compute duration (GB-seconds)                   | Automatic scaling to account limits; Provisioned Concurrency option            | Significant for large containers               | Minimal (serverless)                  | Redeployment required                       | Native with API Gateway, Function URL, CloudWatch, S3, DynamoDB, etc               | Development, prototyping, low-traffic inference endpoints                            |
| **Amazon SageMaker AI (JumpStart)** | x86_64, ARM64 (Graviton), GPU (NVIDIA) | Up to 768GB (on 24xlarge instances) | EBS volumes (up to several TB), FSx, S3 integration | No timeout for inference endpoints              | Hourly instance rates + storage costs; Savings Plans available                  | Auto-scaling based on invocations or custom metrics; Multi-model endpoints       | Minimal with persistent endpoints              | Medium (managed inference)            | Built-in model versioning and staging       | Deep integration with AWS ML services, including EFA for HPC                        | Production ML workloads, high-throughput inference, regulated environments          |
| **Amazon Bedrock**          | Managed by AWS          | Managed by AWS                | Managed by AWS                                  | API timeout: 30 seconds for standard requests | Pay-per-token pricing (input/output tokens)                          | Transparent, fully-managed scaling                                       | None (always available)                        | None (fully managed)                  | Automatic updates by AWS                   | Native with all AWS services; Guardrails for content filtering                      | Enterprise applications, content generation, customer-facing applications          |
| **Amazon EKS**              | x86_64, ARM64, GPU (NVIDIA), AWS Inferentia, Trainium | Limited by node type (up to 24TB with u-24tb1.metal) | EBS, EFS, FSx, persistent volumes, instance store | Configurable – no built-in limits              | EC2/Fargate costs + $0.10/hour per cluster                           | HPA/VPA/Cluster Autoscaler/Karpenter; Complex scaling strategies                 | Depends on warm pool configuration            | High (Kubernetes expertise required)  | CI/CD / GitOps pipelines can be used       | Native integration with numerous AWS services                                      | Complex ML pipelines, multi-model serving, custom scaling requirements             |
| **Amazon ECS Fargate**      | x86_64, ARM64          | Up to 120GB per task          | EFS integration, ephemeral storage (up to 200GB) | No built-in task timeout                        | vCPU and memory per second; Fargate Savings Plans available           | Service Auto Scaling based on CloudWatch metrics, target tracking, step scaling | Moderate (task startup time: 10–15 seconds)  | Low-Medium (container orchestration) | Task definition updates for new models      | Native integration with CloudWatch, ALB, VPC                                       | Mid-scale deployments, containerized applications with moderate resource needs     |


## Useful commands

The `cdk.json` file tells the CDK Toolkit how to execute your app.

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

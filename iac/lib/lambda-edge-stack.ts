import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export class LambdaEdgeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const lambdaEdgeFunction = new NodejsFunction(this, "LambdaEdgeFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: "./lib/lambda-edge/origin-request-sigv4-signer.ts",
      handler: "handler",
      memorySize: 1769,
      timeout: cdk.Duration.seconds(5),
      role: new iam.Role(this, "LambdaEdgeFunctionRole", {
        assumedBy: new iam.CompositePrincipal(
          new iam.ServicePrincipal("lambda.amazonaws.com"),
          new iam.ServicePrincipal("edgelambda.amazonaws.com"),
        ),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
          iam.ManagedPolicy.fromAwsManagedPolicyName("AWSLambda_FullAccess"),
        ],
      }),
    });

    new ssm.StringParameter(this, `${id}-Origin-Request-Sigv4-Signer-Fn-Id`, {
      description: "The Lambda@Edge ARN for CloudFront",
      parameterName: "/LambdaFunctionUrlsSigv4SignerSample/LambdaEdgeArn",
      stringValue: lambdaEdgeFunction.currentVersion.functionArn,
      tier: ssm.ParameterTier.STANDARD,
    });
  }
}

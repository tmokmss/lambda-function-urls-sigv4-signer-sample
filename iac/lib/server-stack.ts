import * as lambdaPython from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class ServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambda = new cdk.aws_lambda.Function(this, "Lambda", {
      code: cdk.aws_lambda.Code.fromInline(`
def handler(_event, _context):
    return {
        'statusCode': 200,
        'body': 'Hello from Lambda!'
    }
`),
      handler: "index.handler",
      runtime: cdk.aws_lambda.Runtime.PYTHON_3_12,
      architecture: cdk.aws_lambda.Architecture.ARM_64,
      memorySize: 1769,
      timeout: cdk.Duration.minutes(15),
    });

    const lambdaFunctionUrl = lambda.addFunctionUrl({
      authType: cdk.aws_lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedMethods: [cdk.aws_lambda.HttpMethod.ALL],
        allowedOrigins: ["*"],
      },
    });

    new cdk.CfnOutput(this, "LambdaFunctionUrl", {
      value: lambdaFunctionUrl.url,
    });
  }
}

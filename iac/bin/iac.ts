#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { ServerStack } from "../lib/server-stack";
import { LambdaEdgeStack } from "../lib/lambda-edge-stack";

const app = new cdk.App();

const lambdaEdgeStack = new LambdaEdgeStack(app, "Sigv4SignerLambdaEdgeStack", {
  env: { region: "us-east-1" },
});

new ServerStack(app, "Sigv4SignerServerStack").addDependency(lambdaEdgeStack);

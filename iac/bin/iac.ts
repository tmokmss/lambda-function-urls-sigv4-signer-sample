#!/usr/bin/env node

import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { ServerStack } from "../lib/server-stack";

const app = new cdk.App();
new ServerStack(app, "Sigv4SignerServerStack");

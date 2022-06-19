#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {InfrastructureStack} from '../lib/infrastructure-stack';
import {CustomResourcesStack} from "../lib/custom-resources-stack";

const app = new cdk.App();

new CustomResourcesStack(app, 'CustomResourceStack', {
  env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
})

new InfrastructureStack(app, 'InfrastructureStack', {
  env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
});



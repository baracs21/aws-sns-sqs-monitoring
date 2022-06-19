import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Code, Function, Runtime} from 'aws-cdk-lib/aws-lambda';
import {RetentionDays} from "aws-cdk-lib/aws-logs";

export class CustomResourcesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Function(this, 'extended-topic', {
      functionName: 'ExtendedTopic',
      runtime: Runtime.GO_1_X,
      handler: 'topic-monitoring',
      code: Code.fromAsset('../src/.build/topic-monitoring.zip'),
      logRetention: RetentionDays.ONE_DAY,
      memorySize: 128
    })
  }
}

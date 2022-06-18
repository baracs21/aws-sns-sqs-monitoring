import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Subscription, SubscriptionProtocol, Topic} from 'aws-cdk-lib/aws-sns';
import {Queue} from 'aws-cdk-lib/aws-sqs';
import {Lambda} from 'aws-cdk-lib/aws-ses-actions';
import {Function, Runtime} from 'aws-cdk-lib/aws-lambda';

export class CustomResourcesStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new Function(this, 'extended-topic', {
      functionName: 'ExtendedTopic',
      runtime: Runtime.GO_1_X,
      handler:
    })
  }
}

import {CustomResource} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Code, Function, Runtime} from 'aws-cdk-lib/aws-lambda';
import {RetentionDays} from "aws-cdk-lib/aws-logs";
import {Effect, IRole, ManagedPolicy, Policy, PolicyStatement} from 'aws-cdk-lib/aws-iam';
import {Provider} from "aws-cdk-lib/custom-resources";
import {ITopic} from "aws-cdk-lib/aws-sns";

// https://github.com/aws-samples/aws-cdk-examples/blob/master/typescript/custom-resource/my-custom-resource

export interface CustomResourceProps {
  role: IRole;
  topic: ITopic;
}

export class SnsCustomResources extends Construct {
  constructor(scope: Construct, id: string, props: CustomResourceProps) {
    super(scope, id)

    const extendTopicFunction = new Function(this, 'extended-topic', {
      functionName: 'ExtendedTopic',
      runtime: Runtime.GO_1_X,
      handler: 'topic-monitoring',
      code: Code.fromAsset('../src/.build/topic-monitoring.zip'),
      logRetention: RetentionDays.ONE_DAY,
      memorySize: 128,
    })

    extendTopicFunction.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSNSFullAccess'))
    extendTopicFunction.role?.attachInlinePolicy(new Policy(this, 'lambda-pass-role-policy', {
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          resources: [
            props.role.roleArn
          ],
          actions: [
            'iam:PassRole'
          ]
        })
      ]
    }))

    const provider = new Provider(this, 'provider', {
      onEventHandler: extendTopicFunction,
    })

    new CustomResource(this, 'resource', {
      serviceToken: provider.serviceToken,
      properties: {
        RoleArn: props.role.roleArn,
        TopicArn: props.topic.topicArn
      },
    })

  }
}

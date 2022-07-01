import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Subscription, SubscriptionProtocol, Topic} from 'aws-cdk-lib/aws-sns';
import {Queue} from 'aws-cdk-lib/aws-sqs';
import {Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";
import {SnsCustomResources} from "./components/sns-custom-resources";

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const topic = new Topic(this, 'my-topic', {
      topicName: 'my-topic',
    })

    const snsRole = new Role(this, 'sns-feedback-role', {
      roleName: 'SNSFeedback',
      assumedBy: new ServicePrincipal("sns.amazonaws.com"),
      inlinePolicies: {
        "logPolicy": new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:PutMetricFilter",
                "logs:PutRetentionPolicy"
              ],
              resources: [
                '*'
              ]
            }),
          ]
        })
      },
    })

    const queue = new Queue(this, 'my-queue', {
      queueName: 'my-queue',
    })

    new Subscription(this, 'my-sub', {
      topic: topic,
      endpoint: queue.queueArn,
      protocol: SubscriptionProtocol.SQS
    })

    queue.addToResourcePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      principals: [
        new ServicePrincipal('sns.amazonaws.com')
      ],
      resources: [
        queue.queueArn
      ],
      actions: [
        'sqs:SendMessage'
      ],
      conditions: {
        ArnEquals: {
          'aws:SourceArn': topic.topicArn
        }
      }
    }))

    new SnsCustomResources(this, 'sns-sqs', {
      role: snsRole,
      topic: topic
    })

  }
}

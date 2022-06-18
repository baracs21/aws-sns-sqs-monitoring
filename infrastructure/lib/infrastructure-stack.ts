import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Subscription, SubscriptionProtocol, Topic} from 'aws-cdk-lib/aws-sns';
import {Queue} from 'aws-cdk-lib/aws-sqs';

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const topic = new Topic(this, 'my-topic', {
      topicName: 'my-topic',
    })

    const queue = new Queue(this, 'my-queue', {
      queueName: 'my-queue',
    })

    new Subscription(this, 'my-sub', {
      topic: topic,
      endpoint: queue.queueUrl,
      protocol: SubscriptionProtocol.SQS
    })
  }
}

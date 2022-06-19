package main

import (
	"context"
	"github.com/aws/aws-lambda-go/cfn"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/sns"
)

func main() {
	lambda.Start(cfn.LambdaWrap(handler))
}

func handler(ctx context.Context, event cfn.Event) (physicalResourceID string, data map[string]interface{}, err error) {
	topicName := event.ResourceProperties["TopicName"].(string)
	client := sns.NewFromConfig(*aws.NewConfig())
	topic, _ := client.CreateTopic(ctx, &sns.CreateTopicInput{
		Name: aws.String(topicName),
	})
	tData := map[string]interface{}{"Arn": topic.TopicArn}
	return topicName, tData, nil
}

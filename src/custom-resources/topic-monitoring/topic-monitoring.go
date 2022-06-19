package main

import (
	"context"
	"github.com/aws/aws-lambda-go/cfn"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sns"
)

func main() {
	lambda.Start(cfn.LambdaWrap(handler))
}

func handler(ctx context.Context, event cfn.Event) (physicalResourceID string, data map[string]interface{}, err error) {
	tData := map[string]interface{}{}
	cfg, _ := config.LoadDefaultConfig(ctx)
	if event.RequestType == "Create" {
		topicName := event.ResourceProperties["TopicName"].(string)
		client := sns.NewFromConfig(cfg)
		topic, err := client.CreateTopic(ctx, &sns.CreateTopicInput{
			Name: aws.String(topicName),
		})
		physicalResID := ""
		if topic != nil {
			physicalResID = aws.ToString(topic.TopicArn)
		}
		return physicalResID, tData, err
	}
	if event.RequestType == "Delete" {
		topicArn := event.PhysicalResourceID
		client := sns.NewFromConfig(cfg)
		_, err = client.DeleteTopic(ctx, &sns.DeleteTopicInput{
			TopicArn: aws.String(topicArn),
		})
		return topicArn, tData, err
	}
	return "", tData, nil
}

package main

import (
	"context"
	"github.com/aws/aws-lambda-go/cfn"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sns"
	"log"
)

func main() {
	lambda.Start(cfn.LambdaWrap(handler))
}

func handler(ctx context.Context, event cfn.Event) (physicalResourceID string, data map[string]interface{}, err error) {
	tData := map[string]interface{}{}
	cfg, _ := config.LoadDefaultConfig(ctx)
	client := sns.NewFromConfig(cfg)
	topicArn := event.ResourceProperties["TopicArn"].(string)
	if event.RequestType == "Create" {
		roleArn := event.ResourceProperties["RoleArn"].(string)

		_, err := client.SetTopicAttributes(ctx, &sns.SetTopicAttributesInput{
			TopicArn:       aws.String(topicArn),
			AttributeName:  aws.String("SQSFailureFeedbackRoleArn"),
			AttributeValue: aws.String(roleArn),
		})

		if err != nil {
			log.Printf("SQSFailureFeedbackRoleArn, ERROR: %s, %s", err, roleArn)
			return "", tData, err
		}

		_, err = client.SetTopicAttributes(ctx, &sns.SetTopicAttributesInput{
			TopicArn:       aws.String(topicArn),
			AttributeName:  aws.String("SQSSuccessFeedbackRoleArn"),
			AttributeValue: aws.String(roleArn),
		})

		if err != nil {
			log.Printf("SQSSuccessFeedbackRoleArn, ERROR: %s, %s", err, roleArn)
			return "", tData, err
		}

		_, err = client.SetTopicAttributes(ctx, &sns.SetTopicAttributesInput{
			TopicArn:       aws.String(topicArn),
			AttributeName:  aws.String("SQSSuccessFeedbackSampleRate"),
			AttributeValue: aws.String("100"),
		})

		if err != nil {
			log.Printf("SQSSuccessFeedbackSampleRate, ERROR: %s", err)
			return "", tData, err
		}

		return topicArn, tData, err
	}

	if event.RequestType == "Delete" {
		_, err := client.SetTopicAttributes(ctx, &sns.SetTopicAttributesInput{
			TopicArn:       aws.String(topicArn),
			AttributeName:  aws.String("SQSSuccessFeedbackRoleArn"),
			AttributeValue: aws.String(""),
		})

		if err != nil {
			return "", tData, err
		}

		_, err = client.SetTopicAttributes(ctx, &sns.SetTopicAttributesInput{
			TopicArn:       aws.String(topicArn),
			AttributeName:  aws.String("SQSFailureFeedbackRoleArn"),
			AttributeValue: aws.String(""),
		})

		if err != nil {
			return "", tData, err
		}

		_, err = client.SetTopicAttributes(ctx, &sns.SetTopicAttributesInput{
			TopicArn:       aws.String(topicArn),
			AttributeName:  aws.String("SQSSuccessFeedbackSampleRate"),
			AttributeValue: aws.String("100"),
		})
		
		return topicArn, tData, err
	}

	return "", tData, nil
}

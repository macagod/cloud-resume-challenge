package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type VisitorCount struct {
	ID    string `dynamodbav:"id" json:"id"`
	Count int    `dynamodbav:"count" json:"count"`
}

var (
	dynamoClient *dynamodb.Client
	tableName    string
)

func init() {
	tableName = os.Getenv("TABLE_NAME")
	if tableName == "" {
		tableName = "VisitorCount"
	}

	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		panic(fmt.Sprintf("unable to load SDK config: %v", err))
	}
	dynamoClient = dynamodb.NewFromConfig(cfg)
}

func handler(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// Increment visitor count in DynamoDB
	updateInput := &dynamodb.UpdateItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"id": &types.AttributeValueMemberS{Value: "visitor-count"},
		},
		UpdateExpression: aws.String("ADD #count :inc"),
		ExpressionAttributeNames: map[string]string{
			"#count": "count",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":inc": &types.AttributeValueMemberN{Value: "1"},
		},
		ReturnValues: types.ReturnValueAllNew,
	}

	result, err := dynamoClient.UpdateItem(ctx, updateInput)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers: map[string]string{
				"Access-Control-Allow-Origin":  "*",
				"Access-Control-Allow-Methods": "POST, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
			},
			Body: fmt.Sprintf(`{"error": "Failed to update count: %v"}`, err),
		}, nil
	}

	// Parse the result
	var visitorCount VisitorCount
	err = attributevalue.UnmarshalMap(result.Attributes, &visitorCount)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
			Headers: map[string]string{
				"Access-Control-Allow-Origin":  "*",
				"Access-Control-Allow-Methods": "POST, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
			},
			Body: fmt.Sprintf(`{"error": "Failed to parse count: %v"}`, err),
		}, nil
	}

	// Return the count
	responseBody, _ := json.Marshal(map[string]int{
		"count": visitorCount.Count,
	})

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Headers: map[string]string{
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
			"Content-Type":                 "application/json",
		},
		Body: string(responseBody),
	}, nil
}

func main() {
	lambda.Start(handler)
}

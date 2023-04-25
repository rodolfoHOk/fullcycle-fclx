package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

const YOUR_OPEN_AI_TOKEN = "sk=???"

type Message struct {
	Role string `json:"role"`
	Content string `json:"content"`
}

type Request struct {
	Model string `json:"model"`
	Messages []Message `json:"messages"`
	MaxTokens int `json:"max_tokens"`
}

type Choices struct {
	Index int `json:"index"`
	Message struct {
		Role string `json:"role"`
		Content string `json:"content"`
	} `json:"message"`
}

type Response struct {
	ID string `json:"id"`
	Object string `json:"object"`
	Created int `json:"created"`
	Choices []Choices `json:"choices"`
}

func GenerateGPTText(query string) (string, error) {
	req := Request {
		Model: "gpt-3.5-turbo",
		Messages: []Message{
			{
				Role: "user",
				Content: query,
			},
		},
		MaxTokens: 300,
	}
	reqJson, err := json.Marshal(req)
	if err != nil {
		return "", err
	}

	request, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(reqJson))
	if err != nil {
		return "", err
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("Authorization", "Bearer " + YOUR_OPEN_AI_TOKEN)

	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()

	respBody, err := io.ReadAll(request.Body)
	if err != nil {
		return "", err
	}

	var resp Response
	err = json.Unmarshal(respBody, &resp)
	if err != nil {
		return "", err
	}

	return resp.Choices[0].Message.Content, nil
}

func parseBase64RequestData(r string) (string, error) {
	dataBytes, err := base64.StdEncoding.DecodeString(r)
	if err != nil {
		return "", err
	}

	data, err := url.ParseQuery(string(dataBytes))
	if err != nil {
		return "", err
	}

	if (!data.Has("Body")) {
		return data.Get("Body"), nil
	}

	return "", errors.New("body not found")
}

func process(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	result, err := parseBase64RequestData(request.Body)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: err.Error(),
		}, err
	}

	text, err := GenerateGPTText(result)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: http.StatusInternalServerError,
			Body: err.Error(),
		}, err 
	}

	return events.APIGatewayProxyResponse{
		StatusCode: http.StatusOK,
		Body: text,
	}, nil
}

func main() {
	lambda.Start(process)
}

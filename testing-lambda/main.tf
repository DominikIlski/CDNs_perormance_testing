variable "region" {
  description = "The region where to deploy the resources"
  type        = string
}

variable "website_url" {
  description = "The URL of the website to test"
  type        = string
}

variable "website_name" {
  description = "The name of tested website"
  type        = string
}


provider "aws" {
  region = var.region
}

resource "aws_iam_role" "lambda_exec" {
  name = "lambda_exec_role"

  assume_role_policy = jsonencode({
    Version   = "2012-10-17"
    Statement = [
      {
        Action    = "sts:AssumeRole"
        Effect    = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

#data "archive_file" "lambda_zip" {
#  type        = "zip"
#  source_dir  = "${path.module}/lambda"
#  output_path = "${path.module}/lambda.zip"
#}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}


resource "aws_lambda_function" "website_test" {
  function_name = "website_test"
  handler = "index.handler"
  runtime = "nodejs14.x"
  s3_bucket         = "lambda-code-web-test"
  s3_key            = "lambda.zip"
  timeout = 180
  memory_size = 2500
  role = aws_iam_role.lambda_exec.arn

  environment {
    variables = {
      WEBSITE_URL = var.website_url
      REGION = var.region
      WEBSITE_NAME = var.website_name
      BUCKET_NAME = aws_s3_bucket.test_reports.bucket
    }
  }
}

resource "aws_cloudwatch_event_rule" "every_six_hours" {
  schedule_expression = "rate(6 hours)"
}

resource "aws_cloudwatch_event_target" "every_six_hours" {
  rule      = aws_cloudwatch_event_rule.every_six_hours.name
  target_id = "test_website"
  arn       = aws_lambda_function.website_test.arn
}

resource "aws_lambda_permission" "allow_cloudwatch" {
  statement_id  = "AllowExecutionFromCloudWatch"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.website_test.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.every_six_hours.arn
}

resource "aws_s3_bucket" "test_reports" {
  bucket = "website-test-reports"
  acl    = "private"
  versioning {
    enabled = true
  }
}

resource "aws_apigatewayv2_api" "lambda_api" {
  name          = "lambda-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.lambda_api.id
  integration_type = "AWS_PROXY"

  connection_type      = "INTERNET"
  description          = "Lambda integration"
  integration_method   = "POST"
  integration_uri      = aws_lambda_function.website_test.invoke_arn
}

resource "aws_apigatewayv2_route" "lambda_route" {
  api_id    = aws_apigatewayv2_api.lambda_api.id
  route_key = "POST /"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_stage" "lambda_stage" {
  api_id = aws_apigatewayv2_api.lambda_api.id
  name   = "test"
  auto_deploy = true
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.website_test.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.lambda_api.execution_arn}/*/*"
}

output "invoke_url" {
  value = aws_apigatewayv2_stage.lambda_stage.invoke_url
}


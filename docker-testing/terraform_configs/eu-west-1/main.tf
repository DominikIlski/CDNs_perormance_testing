variable "region" {
  description = "AWS region"
  type        = string
}

variable "s3_bucket" {
  description = "S3 bucket name"
  type        = string
}

variable "docker_image" {
  description = "ECR Docker image URL"
  type        = string
}

terraform {
  backend "local" {}
}

provider "aws" {
  region = var.region
}

resource "aws_ecs_cluster" "cluster" {
  name = "web-testing-performance"
}

resource "aws_ecs_task_definition" "task" {
  family                   = "testing"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "4096"
  memory                   = "8192"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([{
    name : "web-performance-testing-${var.region}",
    image : var.docker_image,
    essential : true,
    environment : [
      { "name" : "REGION", "value" : var.region },
      { "name" : "S3_BUCKET", "value" : var.s3_bucket }
    ]
  }])
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecs_task_execution_role-${var.region}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy_attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_cloudwatch_event_rule" "every_six_hours" {
  name                = "every-six-hours"
  description         = "Fires every six hours"
  schedule_expression = "cron(0 6,12,18,0 1-30 6 ? *)"
}

resource "aws_cloudwatch_event_target" "run_task_every_six_hours" {
  rule      = aws_cloudwatch_event_rule.every_six_hours.name
  target_id = "run-ecs-task"
  arn       = aws_ecs_cluster.cluster.arn
  role_arn = aws_iam_role.ecs_task_execution_role.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.task.arn
  }
}

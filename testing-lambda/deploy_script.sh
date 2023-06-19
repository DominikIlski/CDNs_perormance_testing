#!/bin/bash

# array of AWS regions
declare -a regions=("us-east-1" "eu-west-1" "ap-southeast-1")

# array of website URLs
declare -a websites=("web-performance-testing.pages.dev" "web-performance-testing-2.pages.dev" "web-performance-testing-two.vercel.app" "web-performance-testing-heavy.vercel.app")

declare -a websites_names=("simple_pages" "heavy_pages" "simple_vercel" "heavy_vercel")
# name of the Terraform workspace

# loop over the regions
for index in ${!regions[@]}; do
  region=${regions[$index]}
  websites_name=${websites_names[$index]}
  website=${websites[$index]}
  workspace_name=$region-$websites_name

  echo "Deploying Lambda to region: $region for website: $website"

  # set the AWS region
  export AWS_DEFAULT_REGION=$region

  export AWS_REGION=$region

  export TF_VAR_region=$region

  # set the website URL
  export TF_VAR_website_url=$website

  export TF_VAR_website_name=$websites_name

  # initialize Terraform
  terraform init

  # create a new workspace (if it doesn't already exist)
  terraform workspace new $workspace_name || true

  # select the workspace
  terraform workspace select $workspace_name

  # apply the Terraform configuration
  terraform apply -auto-approve
done

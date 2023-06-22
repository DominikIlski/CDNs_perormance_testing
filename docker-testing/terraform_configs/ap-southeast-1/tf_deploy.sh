#!/bin/bash
DOCKER_IMAGE=$1
S3_BUCKET_NAME=website-test-reports
# Array of AWS regions
regions=("ap-southeast-1")

echo "$DOCKER_IMAGE"

# Iterate over the regions
for region in "${regions[@]}"
do
#  echo "Deploying to region $region"

  export AWS_DEFAULT_REGION=$region

  export AWS_REGION=$region

  export TF_VAR_region=$region

  export TF_VAR_s3_bucket=$S3_BUCKET_NAME

  export TF_VAR_docker_image=$DOCKER_IMAGE


  # set the website URL

  # initialize Terraform
   terraform init
  # Apply the Terraform configuration
   terraform apply -auto-approve
done

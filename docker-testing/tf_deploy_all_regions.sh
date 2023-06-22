#!/bin/bash
DOCKER_IMAGE=$1

cd ./terraform_configs/ap-southeast-1/ || exit
bash tf_deploy.sh "$DOCKER_IMAGE"
cd ../eu-west-1/ || exit
bash tf_deploy.sh "$DOCKER_IMAGE"
cd ../us-east-1/ || exit
bash tf_deploy.sh "$DOCKER_IMAGE"

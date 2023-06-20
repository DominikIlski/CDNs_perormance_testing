#!/bin/bash


declare -a websites=("web-performance-testing.pages.dev" "web-performance-testing-2.pages.dev" "web-performance-testing-two.vercel.app" "web-performance-testing-heavy.vercel.app")
declare -a websites_names=("simple_pages" "heavy_pages" "simple_vercel" "heavy_vercel")


# Ensure reports directory exists
mkdir -p ./reports

for index in ${!websites[*]}
do
    WEBSITE_URL=${websites[$index]}
    WEBSITE_NAME=${websites_names[$index]}
    CURRENT_TIME=$(date -u +%Y-%m-%d-%H)
    REPORT_NAME="${WEBSITE_NAME}-${REGION}-${CURRENT_TIME}.json"

    echo "Running Lighthouse audit for $WEBSITE_URL in region $REGION..."
    lighthouse "$WEBSITE_URL" --only-categories=performance --output=json --output-path=./reports/"$REPORT_NAME" --chrome-flags="--headless --disable-gpu"
    aws s3 cp ./reports/"$REPORT_NAME" s3://"$S3_BUCKET"/"$REPORT_NAME"
done

#!/bin/bash

declare -a websites=("https://web-performance-testing.pages.dev" "https://web-performance-testing-2.pages.dev" "https://web-performance-testing-two.vercel.app" "https://web-performance-testing-heavy.vercel.app")
declare -a websites_names=("simple_pages" "heavy_pages" "simple_vercel" "heavy_vercel")

for i in "${!websites[@]}"; do
  WEBSITE_URL="${websites[$i]}" WEBSITE_NAME="${websites_names[$i]}" REGION="$REGION" S3_BUCKET_NAME="$S3_BUCKET" node /app/lambda/index.js
done

exit 0
#!/bin/bash

OUTPUT_DIR="./output"
COMPLETE_DIR="./output-complete"

# Create the output-complete directory if it doesn't exist
mkdir -p "$COMPLETE_DIR"

# Loop through each file in the output directory
for file in "$OUTPUT_DIR"/*; do
  # Check if the file is a CSV file
  if [[ $file == *.csv ]]; then
    # Extract the file name without the path
    filename=$(basename "$file")

    # Set the FILE_NAME environment variable
    export FILE_NAME="$filename"

    # Spawn a Node.js process to execute the script for the file
    node datascript.js

    # Unset the FILE_NAME environment variable
    unset FILE_NAME
  fi
done

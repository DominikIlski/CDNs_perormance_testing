#!/bin/bash

OUTPUT_COMPLETE_DIR="./output-complete"
OUTPUT_NEW="./no_24_T_3"

# Check if the output-complete directory exists
if [ ! -d "$OUTPUT_COMPLETE_DIR" ]; then
  echo "Output-complete directory not found!"
  exit 1
fi

# Check if the output-new directory exists, create it if not
if [ ! -d "$OUTPUT_NEW" ]; then
  mkdir "$OUTPUT_NEW"
fi

# Loop through each file in the output-complete directory
for file in "$OUTPUT_COMPLETE_DIR"/*; do
  # Check if the file is a regular file
  if [ -f "$file" ]; then
    # Get the filename without the directory path
    filename=$(basename "$file")

    # Replace 'T' with space ' ' and '24:' with '00:' in the file
    sed -e 's/T/ /g' -e 's/24:/00:/g' "$file" > "$OUTPUT_NEW/$filename"
    echo "Updated file: $OUTPUT_NEW/$filename"
  fi
done

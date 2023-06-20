# Start from a base image with Ubuntu
FROM ubuntu:20.04

ENV REGION us-east-1
ENV S3_BUCKET website-test-reports
# Install required packages
RUN apt-get update && apt-get install -y curl unzip wget gnupg cron

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs

# Install AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm awscliv2.zip

# Install Google Chrome
# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install gnupg wget -y && \
    wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install google-chrome-stable -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory in the container to /app
RUN mkdir -p ~/.aws

# Copy the .credentials file to the container
COPY .credentials /root/.aws/credentials

COPY crontab crontab

WORKDIR /app

# Copy all files
COPY ./ .

RUN mkdir -p /app/reports

# Copy the entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

# Make the entrypoint script executable
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set the entrypoint script as the entrypoint for the container
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
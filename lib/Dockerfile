FROM public.ecr.aws/lambda/python:3.13-arm64

# Copy Python handler (changes less frequently)
COPY lambda/index.py ${LAMBDA_TASK_ROOT}/

# Install tools and Ollama in a single layer to reduce image size
RUN dnf install -y wget gzip tar \
    && wget https://github.com/ollama/ollama/releases/download/v0.5.12/ollama-linux-arm64.tgz -O /tmp/ollama.tgz \
    && mkdir -p /mnt \
    && tar -xzf /tmp/ollama.tgz -C /mnt \
    && rm -rf /tmp/ollama.tgz \
    && chmod +x /mnt/bin/ollama \
    && dnf clean all \
    && rm -rf /var/cache/dnf/*

# Create optimized entrypoint script
RUN echo '#!/bin/sh\n\
# Start Ollama in background\n\
cd /tmp\n\
nohup /mnt/bin/ollama serve > /tmp/ollama.log 2>&1 &\n\
\n\
# Wait for Ollama to initialize (max 5 seconds)\n\
for i in {1..5}; do\n\
  if /mnt/bin/ollama list >/dev/null 2>&1; then\n\
    break\n\
  fi\n\
  sleep 1\n\
done\n\
\n\
# Pre-load the model in background\n\
nohup /mnt/bin/ollama run deepseek-r1:1.5b "Initialize" > /tmp/model_init.log 2>&1 &\n\
\n\
# Execute the Lambda handler\n\
exec /lambda-entrypoint.sh "$@"' > /entrypoint.sh && chmod +x /entrypoint.sh

# Set working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Set the entry point and CMD
ENTRYPOINT ["/entrypoint.sh"]
CMD ["index.lambda_handler"]

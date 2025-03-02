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

# Modify entrypoint.sh to start Ollama first, then proceed with Lambda
RUN sed -i '1i #!/bin/sh\ncd /tmp\nnohup /mnt/bin/ollama serve &\nsleep 1\n/mnt/bin/ollama run deepseek-r1:1.5b Hi' /lambda-entrypoint.sh

# Set working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Set the entry point and CMD
ENTRYPOINT ["/lambda-entrypoint.sh"]

CMD ["index.lambda_handler"]
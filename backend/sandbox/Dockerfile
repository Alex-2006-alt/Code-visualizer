FROM python:3.12-slim

# Create a non-root sandbox user
RUN groupadd -g 10001 sandbox && \
    useradd -u 10001 -g sandbox -m -s /bin/false sandbox

WORKDIR /sandbox

# Copy tracer engine
COPY tracer.py /sandbox/tracer.py

# Set non-root user
USER sandbox

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

ENTRYPOINT ["python", "/sandbox/tracer.py"]

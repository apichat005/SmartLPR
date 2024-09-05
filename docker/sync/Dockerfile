FROM python:3.10-slim-buster
WORKDIR /app
# Set timezone to Asia/Bangkok
RUN ln -snf /usr/share/zoneinfo/Asia/Bangkok /etc/localtime && \
    echo "Asia/Bangkok" > /etc/timezone
# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    cron \
    libmagickwand-dev && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY ./sync/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install "fastapi[standard]"

CMD [ "fastapi", "run", "--host", "0.0.0.0", "--port", "8888" ]
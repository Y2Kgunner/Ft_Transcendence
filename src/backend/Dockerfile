
FROM python:3.8.5

ENV PYTHONUNBUFFERED 1
ENV DOCKERIZE_VERSION v0.6.1

RUN mkdir -p backend && \
    apt-get update && \
    apt-get install bash

RUN pip install --upgrade pip

RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

COPY requirements.txt /backend/requirements.txt
RUN pip3 install -r /backend/requirements.txt

WORKDIR /backend

COPY . .

EXPOSE 8000

CMD bash -c "dockerize -wait tcp://db:5432 -timeout 30s python manage.py runserver 0.0.0.0:8000"

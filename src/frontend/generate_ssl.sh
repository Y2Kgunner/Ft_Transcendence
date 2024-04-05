#!/bin/bash

# Variables
SSL_DIR="ssl"
ROOT_CA_SUBJECT="/CN=My Root CA"
ROOT_CA_DAYS=3650
SERVER_SUBJECT="/CN=127.0.0.1"
SERVER_DAYS=365
CA_KEY="$SSL_DIR/ca.key"
CA_CERT="$SSL_DIR/ca.crt"
SERVER_KEY="$SSL_DIR/server.key"
SERVER_CSR="$SSL_DIR/server.csr"
SERVER_CERT="$SSL_DIR/server.crt"
SERVER_PEM="$SSL_DIR/server.pem"

mkdir -p "$SSL_DIR"

openssl req -x509 -newkey rsa:4096 -keyout "$CA_KEY" -out "$CA_CERT" -days "$ROOT_CA_DAYS" -nodes -subj "$ROOT_CA_SUBJECT"

openssl req -new -newkey rsa:4096 -keyout "$SERVER_KEY" -out "$SERVER_CSR" -nodes -subj "$SERVER_SUBJECT"

openssl x509 -req -in "$SERVER_CSR" -CA "$CA_CERT" -CAkey "$CA_KEY" -CAcreateserial -out "$SERVER_CERT" -days "$SERVER_DAYS"

cat "$SERVER_CERT" "$SERVER_KEY" > "$SERVER_PEM"

cat "$CA_CERT"
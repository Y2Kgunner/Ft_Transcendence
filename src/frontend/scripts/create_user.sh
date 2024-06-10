#!/bin/bash

REGISTER_URL="https://127.0.0.1:443/api/register"
LOGIN_URL="https://127.0.0.1:443/api/login" 
GAME_SESSION_URL="https://127.0.0.1:443/api/create_game_session" 

> logs.txt

for i in {1..100}
do
  NAME=$(cat /dev/urandom | tr -dc 'a-zA-Z' | fold -w 8 | head -n 1)
  EMAIL="$NAME@example.com"
  PASSWORD=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 12 | head -n 1)
  echo "Username: $NAME, Email: $EMAIL, Password: $PASSWORD" >> logs.txt
  REGISTRATION_JSON=$(jq -n \
                  --arg name "$NAME" \
                  --arg email "$EMAIL" \
                  --arg pwd "$PASSWORD" \
                  '{username: $name, email: $email, password: $pwd}')

  REGISTRATION_RESPONSE=$(curl -k -X POST $REGISTER_URL \
       -H "Content-Type: application/json" \
       -d "$REGISTRATION_JSON" \
       -s)
  if echo "$REGISTRATION_RESPONSE" | grep -q '"message": "Registration successful"'; then
    echo "User $NAME registered successfully."
    LOGIN_JSON=$(jq -n \
                    --arg name "$NAME" \
                    --arg pwd "$PASSWORD" \
                    '{username: $name, password: $pwd}')
    LOGIN_RESPONSE=$(curl -k -X POST $LOGIN_URL \
         -H "Content-Type: application/json" \
         -d "$LOGIN_JSON" \
         -s)
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
    if [[ "$TOKEN" != "null" ]]; then
      echo "User $NAME logged in successfully. Token: $TOKEN"
      

      GAME_SESSION_JSON=$(jq -n \
                           --arg userId "$(echo $REGISTRATION_RESPONSE | jq -r '.user_id')" \
                           --arg gameType "pong" \
                           '{user_id: $userId, game_type: $gameType}')

      GAME_SESSION_RESPONSE=$(curl -k -X POST $GAME_SESSION_URL \
           -H "Content-Type: application/json" \
           -H "Authorization: Bearer $TOKEN" \
           -d "$GAME_SESSION_JSON" \
           -s)

      if echo "$GAME_SESSION_RESPONSE" | grep -q '"message": "game created successfully"'; then
        echo "Game session created for user $NAME."
      else
        echo "Failed to create game session for $NAME. Error: $(echo $GAME_SESSION_RESPONSE | jq '.error')"
      fi
    else
      echo "Failed to login user $NAME. Error: $(echo $LOGIN_RESPONSE | jq '.error')"
    fi
  else
    echo "Failed to register user $NAME. Error: $(echo $REGISTRATION_RESPONSE | jq '.error')"
  fi
  sleep 1
done

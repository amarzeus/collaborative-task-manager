#!/bin/bash

API_URL="http://localhost:3001/api/v1"
EMAIL="apitest_$(date +%s)@test.com"
PASSWORD="Password123!"

echo "--- 1. Registering User ($EMAIL) ---"
RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"API Tester\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f3)

if [ -z "$TOKEN" ]; then
  echo "Registration failed. Response: $RESPONSE"
  exit 1
fi

echo "Token received."

echo "--- 2. Creating Task ---"
TASK_RESPONSE=$(curl -s -X POST "$API_URL/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"API Test Task","description":"Testing comments via API","priority":"HIGH","status":"TODO","dueDate":"2025-12-31"}')

TASK_ID=$(echo $TASK_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f3)

if [ -z "$TASK_ID" ]; then
  echo "Task creation failed. Response: $TASK_RESPONSE"
  exit 1
fi

echo "Task Created: $TASK_ID"

echo "--- 3. Adding Comment ---"
COMMENT_TEXT="Hello from curl"
COMMENT_RESPONSE=$(curl -s -X POST "$API_URL/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"content\":\"$COMMENT_TEXT\",\"taskId\":\"$TASK_ID\"}")

COMMENT_ID=$(echo $COMMENT_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f3)

if [ -z "$COMMENT_ID" ]; then
  echo "Comment creation failed. Response: $COMMENT_RESPONSE"
  exit 1
fi

echo "Comment Created: $COMMENT_ID"

echo "--- 4. Fetching Comments ---"
LIST_RESPONSE=$(curl -s -X GET "$API_URL/tasks/$TASK_ID/comments" \
  -H "Authorization: Bearer $TOKEN")

echo "Comments: $LIST_RESPONSE"

if [[ "$LIST_RESPONSE" == *"$COMMENT_TEXT"* ]]; then
  echo "SUCCESS: Comment found in list."
else
  echo "FAILURE: Comment not found."
  exit 1
fi

echo "--- 5. Deleting Comment ---"
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/comments/$COMMENT_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Delete Response: $DELETE_RESPONSE"

# Verify deletion
LIST_RESPONSE_2=$(curl -s -X GET "$API_URL/tasks/$TASK_ID/comments" \
  -H "Authorization: Bearer $TOKEN")

if [[ "$LIST_RESPONSE_2" != *"$COMMENT_TEXT"* ]]; then
  echo "SUCCESS: Comment deleted."
else
  echo "FAILURE: Comment still exists."
  exit 1
fi

echo "Backend Verification Complete!"

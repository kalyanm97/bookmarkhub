#!/usr/bin/env bash
set -euo pipefail

# Usage:
# DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, UID, LIMIT, OFFSET
# Example:
# DB_HOST=localhost DB_USER=postgres DB_NAME=bookmarkhub UID=0000-... LIMIT=20 ./scripts/run_bookmarks_query.sh

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-bookmarkhub}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-}
UID=${UID:-}
LIMIT=${LIMIT:-50}
OFFSET=${OFFSET:-0}

if [ -z "$UID" ]; then
  uid_sql="NULL"
else
  # simple quoting; do not use for untrusted input
  uid_sql="'${UID//"/\"}'"
fi

export PGPASSWORD="$DB_PASSWORD"

psql "host=$DB_HOST port=$DB_PORT dbname=$DB_NAME user=$DB_USER" <<SQL
SELECT
  b.id,
  b.title,
  b.url,
  b.created_at,
  COALESCE(SUM(CASE WHEN v.value =  1 THEN 1 ELSE 0 END), 0) AS up_count,
  COALESCE(SUM(CASE WHEN v.value = -1 THEN 1 ELSE 0 END), 0) AS down_count,
  COALESCE(MAX(CASE WHEN v.user_id = $uid_sql THEN v.value ELSE 0 END), 0) AS user_vote
FROM bookmarks b
LEFT JOIN votes v ON v.bookmark_id = b.id
LEFT JOIN users u ON u.id = b.user_id
GROUP BY b.id, u.id, u.email, u.display_name
ORDER BY b.created_at DESC
LIMIT $LIMIT OFFSET $OFFSET;
SQL

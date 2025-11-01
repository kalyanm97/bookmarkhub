
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  username varchar(32) UNIQUE,
  display_name varchar(120),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  url text NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS votes (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bookmark_id uuid NOT NULL REFERENCES bookmarks(id) ON DELETE CASCADE,
  value smallint NOT NULL CHECK (value in (-1,1)),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, bookmark_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_bookmark ON votes(bookmark_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);



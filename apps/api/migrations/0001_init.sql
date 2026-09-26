-- Manoj C portfolio — chat, feedback, usage and link events.
--
-- Five small tables. No names, no email addresses and no raw IP addresses are
-- ever stored: a visitor is identified only by a SHA-256 of their address plus
-- a salt that rotates daily, so the same person is a different key tomorrow.
--
-- Run with: npm run migrate --workspace=@manoj/api

create table if not exists chat_sessions (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  visitor_hash    text not null,          -- sha256(ip + daily salt), never the IP
  country         text,                   -- two-letter code from request.cf
  turnstile_ok    boolean not null default false,
  message_count   int not null default 0,
  blocked_until   timestamptz
);

create table if not exists chat_messages (
  id           bigserial primary key,
  session_id   uuid not null references chat_sessions(id) on delete cascade,
  role         text not null check (role in ('user','assistant')),
  content      text not null check (length(content) <= 4000),
  off_topic    boolean not null default false,
  model        text,
  neurons_est  int,
  sources      text[],
  latency_ms   int,
  created_at   timestamptz not null default now()
);

create table if not exists chat_feedback (
  message_id  bigint primary key references chat_messages(id) on delete cascade,
  rating      smallint not null check (rating in (-1, 1)),
  created_at  timestamptz not null default now()
);

create table if not exists usage_daily (
  day             date primary key,       -- UTC day, matching the Workers AI reset
  neurons_est     int not null default 0,
  chat_turns      int not null default 0,
  off_topic_turns int not null default 0
);

create table if not exists link_events (
  id            bigserial primary key,
  name          text not null check (name in (
                  'resume_download','email_click','email_copy','phone_click',
                  'github_click','linkedin_click','repo_click','chat_open')),
  path          text not null,
  referrer_host text,
  created_at    timestamptz not null default now()
);

create index if not exists chat_messages_session_idx
  on chat_messages (session_id, created_at);
create index if not exists link_events_name_idx
  on link_events (name, created_at);
create index if not exists chat_sessions_created_idx
  on chat_sessions (created_at);

-- The Worker's role can read and write rows and delete expired ones. It has no
-- DDL rights; migrations run from CI under a separate role.
--   grant select, insert, delete on all tables in schema public to manoj_worker;
--   grant usage, select on all sequences in schema public to manoj_worker;

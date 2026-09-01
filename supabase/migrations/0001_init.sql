-- VitaSync schema, first pass. Postgres / Supabase. RLS on everything: only the owner reads their record.
create extension if not exists pgcrypto;

create table users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique,                      -- supabase auth.users.id (phone OTP)
  vs_id text unique not null,               -- friendly display id, e.g. VS-ASHA-2381
  share_token text unique not null default encode(gen_random_bytes(8), 'hex'), -- random; used in /u/{token}
  phone text not null,
  name text not null,
  city text,
  blood_group text,
  allergies text[] default '{}',
  emergency_meds text[] default '{}',
  ice_name text, ice_phone text, ice_relation text,
  abha_id text,
  created_at timestamptz default now()
);

create table family_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(id) on delete cascade,
  member_user_id uuid references users(id) on delete cascade,
  relation text,
  otp_target boolean default false           -- nominated caregiver receives share OTPs
);

create type record_type as enum ('consult','report','rx','vital','ai_session');
create table records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type record_type not null,
  occurred_at timestamptz not null,
  provider text,
  title text not null,
  summary text,
  file_ref text,                            -- storage path of client-encrypted blob
  sha256 text,                              -- hash of ciphertext, computed on write
  anchor_tx text,                           -- null until Polygon anchoring ships
  sealed_at timestamptz,
  created_at timestamptz default now()
);

create table vitals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  metric text not null, value numeric not null, unit text,
  measured_at timestamptz not null,
  source text default 'manual'              -- manual | watch | lab
);

create table prescriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  medicine text not null, dosage text, prescriber text, schedule text,
  days_prescribed int not null, started_on date not null,
  record_id uuid references records(id)
);

create table doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null, speciality text, years int, clinic text, fee int,
  lat double precision, lng double precision, verified_at timestamptz
);
create table slots (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references doctors(id) on delete cascade,
  starts_at timestamptz not null, status text default 'open'
);
create table bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  slot_id uuid references slots(id), record_id uuid references records(id),
  status text default 'confirmed', created_at timestamptz default now()
);

create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  urgency text, symptoms text[], recommendation jsonb,
  closed_at timestamptz, record_id uuid references records(id)
);

-- Sharing (locked spec): OTP to patient/caregiver, 10 min, 5 attempts, session per facility, link 24h, revocable.
create table share_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  token text unique not null,
  scope text default 'full',                -- full | last_6m | labs
  expires_at timestamptz not null default now() + interval '24 hours',
  revoked_at timestamptz
);
create table share_otps (
  id uuid primary key default gen_random_uuid(),
  share_link_id uuid references share_links(id) on delete cascade,
  code_hash text not null,                  -- never store the code in clear
  expires_at timestamptz not null,
  attempts int default 0,
  locked_until timestamptz
);
create table access_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  share_link_id uuid references share_links(id),
  grantee text not null,                    -- facility / doctor name as typed
  scope text, expires_at timestamptz not null, revoked_at timestamptz
);
create table access_log (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  actor text not null, action text not null, at timestamptz default now()
);
create table cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  version int default 1, issued_at timestamptz default now(), frozen_at timestamptz
);

-- RLS
alter table users enable row level security;
alter table records enable row level security;
alter table vitals enable row level security;
alter table prescriptions enable row level security;
alter table bookings enable row level security;
alter table chat_sessions enable row level security;
alter table share_links enable row level security;
alter table access_grants enable row level security;
alter table access_log enable row level security;
alter table cards enable row level security;

create policy "own row" on users for all using (auth.uid() = auth_id);
create policy "own records" on records for all using (user_id in (select id from users where auth_id = auth.uid()));
create policy "own vitals" on vitals for all using (user_id in (select id from users where auth_id = auth.uid()));
create policy "own rx" on prescriptions for all using (user_id in (select id from users where auth_id = auth.uid()));
create policy "own bookings" on bookings for all using (user_id in (select id from users where auth_id = auth.uid()));
create policy "own chats" on chat_sessions for all using (user_id in (select id from users where auth_id = auth.uid()));
create policy "own shares" on share_links for all using (user_id in (select id from users where auth_id = auth.uid()));
create policy "own grants" on access_grants for all using (user_id in (select id from users where auth_id = auth.uid()));
create policy "own log" on access_log for select using (user_id in (select id from users where auth_id = auth.uid()));
create policy "own cards" on cards for all using (user_id in (select id from users where auth_id = auth.uid()));
-- Public emergency strip and OTP verification are served by server routes using the service role, never by client RLS.

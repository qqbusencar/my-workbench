-- ============================================================
-- 健身健康数据同步（快捷指令 → Supabase）
-- 在 Supabase 后台 SQL Editor 里一次性执行本文件
-- 对应项目：rmldjztswbfdedwaawhq
-- ============================================================

-- 1) 每日健康快照表（快捷指令写入，App 读取）
create table if not exists public.health_snapshot (
  user_id        uuid        not null references auth.users(id) on delete cascade,
  snapshot_date  date        not null,
  steps          integer     default 0,
  distance_km    numeric(8,2) default 0,
  calories       integer     default 0,
  active_minutes integer     default 0,
  source         text        default 'shortcut',
  synced_at      timestamptz default now(),
  created_at     timestamptz default now(),
  primary key (user_id, snapshot_date)
);

-- 2) 同步码表：快捷指令凭 token 找到属于哪个用户（一人一个码）
create table if not exists public.sync_tokens (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  token      text        not null unique,
  created_at timestamptz default now(),
  primary key (user_id)
);
create index if not exists sync_tokens_token_idx on public.sync_tokens (token);

-- 3) 开启行级安全（RLS）
alter table public.health_snapshot enable row level security;
alter table public.sync_tokens    enable row level security;

-- 4) 策略：用户只能读写自己的数据
drop policy if exists "own health snapshot" on public.health_snapshot;
create policy "own health snapshot" on public.health_snapshot
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own sync token" on public.sync_tokens;
create policy "own sync token" on public.sync_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 说明：sync-health Edge Function 使用 service_role key 运行（绕过 RLS），
-- 仅凭 token 反查 user_id 后写入，外部无法枚举他人数据。

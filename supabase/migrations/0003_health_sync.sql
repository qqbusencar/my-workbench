-- ============================================================
-- 健身健康数据同步（快捷指令 → Supabase，RPC 版）
-- 在 Supabase 后台 SQL Editor 里「新建查询」→ 粘贴本文件全部内容 → 「运行」
-- 一次性执行即可（无需部署 Edge Function、无需配置密钥）
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

-- 3) 行级安全（RLS）：App 端登录后只能读写自己的数据
alter table public.health_snapshot enable row level security;
alter table public.sync_tokens    enable row level security;

drop policy if exists "own health snapshot" on public.health_snapshot;
create policy "own health snapshot" on public.health_snapshot
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own sync token" on public.sync_tokens;
create policy "own sync token" on public.sync_tokens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4) 写入接口：PostgREST RPC（供 iPhone 快捷指令「获取 URL 内容」POST 调用）
--    由 anon 直接调用（无需登录），函数内部用 token 反查用户后写入；
--    外部拿不到 token 就无法写入，也无法枚举他人数据。
drop function if exists public.upsert_health(text,text,integer,numeric,integer,integer);
create or replace function public.upsert_health(
  p_token           text,
  p_date            text,
  p_steps           integer      default 0,
  p_distance_km     numeric      default 0,
  p_calories        integer      default 0,
  p_active_minutes  integer      default 0
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid;
begin
  if p_token is null or p_date is null then
    return json_build_object('ok', false, 'error', 'missing token or date');
  end if;
  select user_id into v_uid from public.sync_tokens where token = p_token;
  if v_uid is null then
    return json_build_object('ok', false, 'error', 'invalid token');
  end if;
  insert into public.health_snapshot
    (user_id, snapshot_date, steps, distance_km, calories, active_minutes, source, synced_at)
  values
    (v_uid, p_date::date,
     greatest(0, coalesce(p_steps,0)),
     greatest(0, coalesce(p_distance_km,0)),
     greatest(0, coalesce(p_calories,0)),
     greatest(0, coalesce(p_active_minutes,0)),
     'shortcut', now())
  on conflict (user_id, snapshot_date) do update set
    steps = excluded.steps,
    distance_km = excluded.distance_km,
    calories = excluded.calories,
    active_minutes = excluded.active_minutes,
    synced_at = now();
  return json_build_object('ok', true, 'date', p_date);
end;
$$;

-- 允许匿名（快捷指令）调用该写入接口
grant execute on function public.upsert_health(text,text,integer,numeric,integer,integer) to anon, authenticated;

// ============================================================
// Supabase Edge Function: sync-health
// 接收 iPhone 快捷指令「获取 URL 内容」POST 的健康数据，
// 用同步码(token)反查用户，写入 health_snapshot 表。
//
// 部署（二选一）：
//  A. 后台：Supabase 后台 → Edge Functions → New Function → 名称 sync-health
//     → 粘贴本文件 → Deploy → 在 Function 的 Secrets 里添加：
//        SUPABASE_URL = https://rmldjztswbfdedwaawhq.supabase.co
//        SUPABASE_SERVICE_ROLE_KEY = <后台 Settings→API 里的 service_role key>
//  B. CLI：supabase functions deploy sync-health --project-ref rmldjztswbfdedwaawhq
//         然后 supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxx --project-ref rmldjztswbfdedwaawhq
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(payload: any, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  // CORS 预检
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const url = Deno.env.get('SUPABASE_URL')
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) return json({ ok: false, error: 'server not configured' }, 500)

    const supabase = createClient(url, key)

    let body: any = {}
    try { body = await req.json() } catch { /* ignore */ }

    const token = body.token
    if (!token) return json({ ok: false, error: 'missing token' }, 400)

    // 用同步码反查用户
    const { data: tk, error: tkErr } = await supabase
      .from('sync_tokens')
      .select('user_id')
      .eq('token', String(token))
      .maybeSingle()

    if (tkErr || !tk) return json({ ok: false, error: 'invalid token' }, 401)

    const date = body.date || new Date().toISOString().slice(0, 10)
    const row = {
      user_id: tk.user_id,
      snapshot_date: String(date),
      steps: Math.max(0, parseInt(body.steps) || 0),
      distance_km: Math.max(0, parseFloat(body.distance_km) || 0),
      calories: Math.max(0, parseInt(body.calories) || 0),
      active_minutes: Math.max(0, parseInt(body.active_minutes) || 0),
      source: 'shortcut',
      synced_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('health_snapshot')
      .upsert(row, { onConflict: 'user_id,snapshot_date' })

    if (error) return json({ ok: false, error: error.message }, 500)

    return json({ ok: true, date, user: tk.user_id })
  } catch (e) {
    return json({ ok: false, error: String(e) }, 500)
  }
})

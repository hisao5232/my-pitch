import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database;
  DISCORD_WEBHOOK_URL: string;
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors({
  origin: '*', 
}))

// ==========================================
// 1. スケジュール用
// ==========================================
app.get('/api/schedules', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM schedules ORDER BY date ASC').all();
  return c.json(results);
});

app.post('/api/schedules', async (c) => {
  const { title, description, date, category } = await c.req.json();
  
  await c.env.DB.prepare(
    'INSERT INTO schedules (title, description, date, category) VALUES (?, ?, ?, ?)'
  ).bind(title, description, date, category || '通知なし').run();
  
  return c.json({ success: true });
});

app.put('/api/schedules/:id', async (c) => {
  const id = c.req.param('id');
  const { title, description, date, category } = await c.req.json();
  
  await c.env.DB.prepare(
    "UPDATE schedules SET title = ?, description = ?, date = ?, category = ? WHERE id = ?"
  )
  .bind(title, description, date, category, id)
  .run();
  
  return c.json({ success: true });
});

app.delete('/api/schedules/:id', async (c) => {
  const id = c.req.param('id');
  
  await c.env.DB.prepare(
    "DELETE FROM schedules WHERE id = ?"
  )
  .bind(id)
  .run();
  
  return c.json({ success: true });
});


// ==========================================
// ★【新設】 休日管理用
// ==========================================

// 💡 不足していたデータ取得用 (GET) エンドポイントを追加！
app.get('/api/holidays', async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT date FROM holidays").all();
    // フロントのstateが string[] 型を期待しているので、日付文字列の配列にして返却
    const dateArray = results ? results.map(r => r.date) : [];
    return c.json(dateArray);
  } catch (e) {
    return c.json({ error: 'Failed to fetch holidays', details: e }, 500);
  }
});

// 休日の切り替え (保存/削除)
app.post('/api/holidays/toggle', async (c) => {
  const { date } = await c.req.json();
  
  const existing = await c.env.DB.prepare("SELECT date FROM holidays WHERE date = ?")
    .bind(date).first();

  if (existing) {
    await c.env.DB.prepare("DELETE FROM holidays WHERE date = ?").bind(date).run();
    return c.json({ isHoliday: false });
  } else {
    await c.env.DB.prepare("INSERT INTO holidays (date) VALUES (?)").bind(date).run();
    return c.json({ isHoliday: true });
  }
});


// ==========================================
// 2. コンディションログ用
// ==========================================
app.get('/api/conditions', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM condition_logs ORDER BY date ASC LIMIT 30'
  ).all();
  return c.json(results);
});

app.post('/api/conditions', async (c) => {
  const { weight, fat, date } = await c.req.json();
  
  try {
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO condition_logs (weight, fat, date) VALUES (?, ?, ?)'
    ).bind(weight, fat, date).run();
    
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e }, 500);
  }
});

app.delete('/api/conditions', async (c) => {
  const date = c.req.query('date');
  
  if (!date) {
    return c.json({ success: false, error: 'Date parameter is required' }, 400);
  }

  try {
    await c.env.DB.prepare(
      "DELETE FROM condition_logs WHERE date = ?"
    )
    .bind(date)
    .run();
    
    return c.json({ success: true, message: `Record for ${date} deleted.` });
  } catch (e) {
    return c.json({ success: false, error: e }, 500);
  }
});


// ==========================================
// 3. お気に入りリンク用
// ==========================================
app.get('/api/links', async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM links ORDER BY id DESC").all();
  return c.json(results);
});

app.post('/api/links', async (c) => {
  const { title, url } = await c.req.json();
  await c.env.DB.prepare("INSERT INTO links (title, url) VALUES (?, ?)")
    .bind(title, url)
    .run();
  return c.json({ success: true });
});

app.delete('/api/links/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare("DELETE FROM links WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});


// ==========================================
// 4. おすすめ動画用
// ==========================================
app.get('/api/videos', async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM videos ORDER BY created_at DESC"
  ).all();
  return c.json(results);
});

app.post('/api/videos', async (c) => {
  const { title, url, category } = await c.req.json();
  
  try {
    await c.env.DB.prepare(
      "INSERT INTO videos (title, url, category) VALUES (?, ?, ?)"
    )
    .bind(title, url, category || '未分類')
    .run();
    
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e }, 500);
  }
});

app.delete('/api/videos/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare("DELETE FROM videos WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});


// ==========================================
// 5. ゴミの日管理用
// ==========================================
app.post('/api/garbage', async (c) => {
  const { date, type } = await c.req.json<{ date: string; type: string }>();

  if (!date || !type) {
    return c.json({ error: 'Missing date or type' }, 400);
  }

  try {
    await c.env.DB.prepare(`
      INSERT INTO garbage_days (date, type)
      VALUES (?, ?)
      ON CONFLICT(date) DO UPDATE SET type = excluded.type
    `).bind(date, type).run();

    return c.json({ success: true, message: `Mission updated: ${date} -> ${type}` });
  } catch (e) {
    console.error(e);
    return c.json({ error: 'Database update failed' }, 500);
  }
});

app.get('/api/garbage', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM garbage_days"
    ).all();
    return c.json(results);
  } catch (e) {
    return c.json({ error: 'Failed to fetch data' }, 500);
  }
});


// ==========================================
// 定期実行（Cron）システム
// ==========================================
export default {
  fetch: app.fetch,
  async scheduled(event: any, env: Bindings, ctx: ExecutionContext) {
    ctx.waitUntil(handleScheduled(env));
  },
};

async function handleScheduled(env: Bindings) {
  const now = new Date();
  const jstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  const todayStr = jstDate.toISOString().split('T')[0];
  const minutes = jstDate.getMinutes();

  if (minutes === 25) {
    const garbageData = await env.DB.prepare(
      "SELECT type FROM garbage_days WHERE date = ?"
    ).bind(todayStr).first<{ type: string }>();

    if (garbageData) {
      const labels: any = { 
        NON_BURNABLE: '不燃ごみ', BATTERY: '電池', BOTTLE: 'ビン', PAPER: '紙' 
      };
      await sendDiscord(env.DISCORD_WEBHOOK_URL, 
        `🗑️ **【廃棄物処理ミッション】**\n本日は **${labels[garbageData.type]}** の回収日です。出撃準備を！`);
    }
  }

  if (minutes === 30) {
    const { results } = await env.DB.prepare(
      "SELECT title FROM schedules WHERE date = ? AND category = '通知あり'"
    ).bind(todayStr).all();

    if (results && results.length > 0) {
      const msg = results.map(s => `・${s.title}`).join('\n');
      await sendDiscord(env.DISCORD_WEBHOOK_URL, 
        `📅 **【本日の作戦予定】**\n${msg}`);
    }
  }
}

async function sendDiscord(url: string, content: string) {
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
}

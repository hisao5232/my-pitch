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

// 1.--- スケジュール用 ---
app.get('/api/schedules', async (c) => {
  // 全カラム取得するので、フロントエンド側で category を参照可能になります
  const { results } = await c.env.DB.prepare('SELECT * FROM schedules ORDER BY date ASC').all();
  return c.json(results);
});

app.post('/api/schedules', async (c) => {
  // category をリクエストボディから取得
  const { title, description, date, category } = await c.req.json();
  
  await c.env.DB.prepare(
    // INSERT文に category を追加
    'INSERT INTO schedules (title, description, date, category) VALUES (?, ?, ?, ?)'
  ).bind(title, description, date, category || '通知なし').run(); // undefined対策で初期値を指定
  
  return c.json({ success: true });
});

// --- スケジュールの更新 (PUT) ---
app.put('/api/schedules/:id', async (c) => {
  const id = c.req.param('id');
  const { title, description, date, category } = await c.req.json();
  
  await c.env.DB.prepare(
    // UPDATE文に category を追加
    "UPDATE schedules SET title = ?, description = ?, date = ?, category = ? WHERE id = ?"
  )
  .bind(title, description, date, category, id)
  .run();
  
  return c.json({ success: true });
});

// --- スケジュールの削除 (DELETE) ---
app.delete('/api/schedules/:id', async (c) => {
  const id = c.req.param('id');
  
  await c.env.DB.prepare(
    "DELETE FROM schedules WHERE id = ?"
  )
  .bind(id)
  .run();
  
  return c.json({ success: true });
});

// 2.コンディションログ用
// GET コンディションログ取得（直近30日分など）
app.get('/api/conditions', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM condition_logs ORDER BY date ASC LIMIT 30'
  ).all();
  return c.json(results);
});

// POST コンディションログを追加・更新
app.post('/api/conditions', async (c) => {
  const { weight, fat, date } = await c.req.json();
  
  try {
    // 同日のデータがあれば上書き(REPLACE)、なければ挿入
    await c.env.DB.prepare(
      'INSERT OR REPLACE INTO condition_logs (weight, fat, date) VALUES (?, ?, ?)'
    ).bind(weight, fat, date).run();
    
    return c.json({ success: true });
  } catch (e) {
    return c.json({ success: false, error: e }, 500);
  }
});

// --- コンディションログの削除 (DELETE) ---
app.delete('/api/conditions', async (c) => {
  // クエリパラメータ ?date=2026-05-04 を取得
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

// 3．お気に入り --- リンク一覧の取得 ---
app.get('/api/links', async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM links ORDER BY id DESC").all();
  return c.json(results);
});

// --- リンクの追加 ---
app.post('/api/links', async (c) => {
  const { title, url } = await c.req.json();
  await c.env.DB.prepare("INSERT INTO links (title, url) VALUES (?, ?)")
    .bind(title, url)
    .run();
  return c.json({ success: true });
});

// --- リンクの削除 ---
app.delete('/api/links/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare("DELETE FROM links WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// 4.おすすめ動画--- 動画一覧の取得 ---
app.get('/api/videos', async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM videos ORDER BY created_at DESC"
  ).all();
  return c.json(results);
});

// --- 動画の追加 ---
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

// --- 動画の削除 ---
app.delete('/api/videos/:id', async (c) => {
  const id = c.req.param('id');
  await c.env.DB.prepare("DELETE FROM videos WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// 5.ゴミの日管理--- ごみの日データの保存エンドポイント ---
app.post('/api/garbage', async (c) => {
  const { date, type } = await c.req.json<{ date: string; type: string }>();

  if (!date || !type) {
    return c.json({ error: 'Missing date or type' }, 400);
  }

  try {
    // 既存データがあれば更新、なければ挿入 (UPSERT)
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

// --- 初期表示用に全データを取得するエンドポイント (GET) ---
app.get('/api/garbage', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM garbage_days"
    ).all();
    
    // フロントエンドのState形式 Record<string, GarbageType> に変換しやすく返却
    return c.json(results);
  } catch (e) {
    return c.json({ error: 'Failed to fetch data' }, 500);
  }
});

// 定期実行（Cron）イベント
export default {
  fetch: app.fetch, // HonoのAPI処理用
  async scheduled(event: any, env: Bindings, ctx: ExecutionContext) {
    ctx.waitUntil(handleScheduled(env)); // 定期実行の処理を非同期で実行
  },
};

async function handleScheduled(env: Bindings) {
  const now = new Date();
  const jstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  const todayStr = jstDate.toISOString().split('T')[0];
  const minutes = jstDate.getMinutes();

  // --- 05:25 ごみの日通知 ---
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

  // --- 05:30 通常スケジュール通知 ---
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

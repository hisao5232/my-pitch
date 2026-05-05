import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors({
  origin: '*', 
}))

// --- スケジュール用 ---
app.get('/api/schedules', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM schedules ORDER BY date ASC').all();
  return c.json(results);
});

app.post('/api/schedules', async (c) => {
  const { title, description, date } = await c.req.json();
  await c.env.DB.prepare(
    'INSERT INTO schedules (title, description, date) VALUES (?, ?, ?)'
  ).bind(title, description, date).run();
  return c.json({ success: true });
});

// --- スケジュールの更新 (PUT) ---
app.put('/api/schedules/:id', async (c) => {
  const id = c.req.param('id');
  const { title, description, date } = await c.req.json();
  
  await c.env.DB.prepare(
    "UPDATE schedules SET title = ?, description = ?, date = ? WHERE id = ?"
  )
  .bind(title, description, date, id)
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

// --- リンク一覧の取得 ---
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

export default app

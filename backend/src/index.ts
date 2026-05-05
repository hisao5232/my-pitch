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

// --- 🔽 ここからコンディションログ用を追加 🔽 ---

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

export default app

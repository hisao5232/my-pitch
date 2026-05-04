import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// フロントエンドからのアクセスを許可
app.use('/api/*', cors({
  origin: '*', // テスト時はこれでもOKですが、本番は 'https://go-pro-world.net' などに絞るのが安全です
}))

// GET スケジュール一覧取得
app.get('/api/schedules', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM schedules').all();
  return c.json(results);
});

// POST 新しい予定を追加
app.post('/api/schedules', async (c) => {
  const { title, description, date } = await c.req.json();
  await c.env.DB.prepare(
    'INSERT INTO schedules (title, description, date) VALUES (?, ?, ?)'
  ).bind(title, description, date).run();
  return c.json({ success: true });
});

export default app

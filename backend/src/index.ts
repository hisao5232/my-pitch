import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// フロントエンドからのアクセスを許可
app.use('/api/*', cors())

app.get('/api/schedules', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM schedules ORDER BY date ASC'
    ).all()
    return c.json(results)
  } catch (e) {
    return c.json({ error: "Failed to fetch schedules" }, 500)
  }
})

// POSTリクエストで新しい予定を追加
app.post('/api/schedules', async (c) => {
  const body = await c.req.json();
  const { title, date, category } = body;

  try {
    await c.env.DB.prepare(
      'INSERT INTO schedules (title, date, category) VALUES (?, ?, ?)'
    ).bind(title, date, category).run();
    
    return c.json({ success: true }, 201);
  } catch (e) {
    return c.json({ error: "Failed to add schedule" }, 500);
  }
});

export default app

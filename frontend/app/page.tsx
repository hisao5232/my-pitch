'use client'
import { useEffect, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import 'react-day-picker/dist/style.css'

type Schedule = {
  id: number; title: string; date: string; category: string;
}

export default function Home() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date())
  
  // フォーム用ステート
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('general')

  const fetchSchedules = () => {
    fetch('http://localhost:8787/api/schedules')
      .then(res => res.json())
      .then(setSchedules)
  }

  useEffect(() => { fetchSchedules() }, [])

  const addSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !selectedDay) return

    const res = await fetch('http://localhost:8787/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        date: format(selectedDay, 'yyyy-MM-dd'),
        category: newCategory
      })
    })

    if (res.ok) {
      setNewTitle('')
      fetchSchedules() // 再読み込み
    }
  }

  const selectedDateStr = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : ''
  const daySchedules = schedules.filter(s => s.date === selectedDateStr)

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 p-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-400">MyPitch Dash</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* カレンダー：ダークなカード */}
        <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl flex justify-center border border-slate-700">
          <style>{`
            .rdp { --rdp-accent-color: #3b82f6; --rdp-background-color: #334155; }
            .rdp-day_selected { background-color: var(--rdp-accent-color) !important; }
          `}</style>
          <DayPicker mode="single" selected={selectedDay} onSelect={setSelectedDay} locale={ja} />
        </div>

        {/* 予定追加フォーム：文字は黒に設定 */}
        <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">予定を追加</h2>
          <form onSubmit={addSchedule} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">内容</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2 rounded bg-white text-black font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="例: サッカー練習"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">カテゴリ</label>
              <select 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2 rounded bg-white text-black font-medium outline-none"
              >
                <option value="general">一般</option>
                <option value="soccer">サッカー</option>
                <option value="work">仕事</option>
                <option value="private">プライベート</option>
              </select>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded font-bold transition">
              追加する ({selectedDateStr})
            </button>
          </form>
        </div>

        {/* 予定リスト */}
        <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">本日のリスト</h2>
          <div className="space-y-3">
            {daySchedules.length > 0 ? (
              daySchedules.map(item => (
                <div key={item.id} className="p-3 rounded bg-[#334155] border-l-4 border-blue-500">
                  <div className="text-white font-bold">{item.title}</div>
                  <div className="text-xs text-slate-400 uppercase">{item.category}</div>
                </div>
              ))
            ) : <p className="text-slate-500 italic text-sm">予定なし</p>}
          </div>
        </div>
      </div>
    </main>
  )
}

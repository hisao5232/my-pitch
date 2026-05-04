'use client'
import { useEffect, useState } from 'react'
import { 
  format, 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addMonths, 
  subMonths,
  isSameMonth
} from 'date-fns'
import { ja } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Schedule = {
  id: number; title: string; description: string; date: string;
}

export default function Home() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const fetchSchedules = () => {
    fetch('http://localhost:8787/api/schedules')
      .then(res => res.json())
      .then(setSchedules)
      .catch(err => console.error("Fetch error:", err))
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
        description: newDescription,
        date: format(selectedDay, 'yyyy-MM-dd')
      })
    })
    if (res.ok) {
      setNewTitle(''); setNewDescription(''); fetchSchedules()
    }
  }

  // --- カレンダー計算ロジック ---
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  })

  const selectedDateStr = format(selectedDay, 'yyyy-MM-dd')
  const daySchedules = schedules.filter(s => s.date === selectedDateStr)

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8">
      <div className="max-w-350 mx-auto">
        
        <h1 className="text-3xl font-bold mb-8 text-blue-400 flex items-center gap-2">
          ⚽ MyPitch Dash
        </h1>
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* --- メインカレンダー領域 --- */}
          <div className="xl:col-span-3 bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
            
            {/* カレンダーヘッダー（月移動） */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50">
              <h2 className="text-2xl font-bold text-blue-400">
                {format(currentMonth, 'yyyy年 M月', { locale: ja })}
              </h2>
              <div className="flex gap-4">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-blue-400">
                  <ChevronLeft size={28} />
                </button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-blue-400">
                  <ChevronRight size={28} />
                </button>
              </div>
            </div>

            {/* 曜日ラベル（グリッドで完全均等化） */}
            <div className="grid grid-cols-7 border-b border-slate-700 bg-slate-800/30">
              {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                <div key={day} className={`py-4 text-center text-sm font-black border-r last:border-r-0 border-slate-700/50 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}>
                  {day}
                </div>
              ))}
            </div>

            {/* カレンダーグリッド */}
            <div className="grid grid-cols-7">
              {calendarDays.map((date, i) => {
                const dateStr = format(date, 'yyyy-MM-dd')
                const dateSchedules = schedules.filter(s => s.date === dateStr)
                const isSelected = isSameDay(date, selectedDay)
                const isCurrentMonth = isSameMonth(date, monthStart)
                const isToday = isSameDay(date, new Date())

                return (
                  <div
                    key={dateStr}
                    onClick={() => setSelectedDay(date)}
                    className={`
                      min-h-32 p-2 border-r border-b border-slate-700/50 transition-all cursor-pointer relative
                      ${!isCurrentMonth ? 'bg-slate-900/20 text-slate-600' : 'hover:bg-slate-700/30'}
                      ${isSelected ? 'bg-blue-900/40 ring-2 ring-inset ring-blue-500/50' : ''}
                      ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}
                    `}
                  >
                    <span className={`text-lg font-black ${isToday ? 'text-blue-400 border-b-2 border-blue-400' : ''}`}>
                      {format(date, 'd')}
                    </span>
                    
                    <div className="mt-2 space-y-1">
                      {dateSchedules.map(s => (
                        <div key={s.id} className="text-xs font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded truncate shadow-sm">
                          {s.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* --- 右サイドバー：入力 & 詳細 --- */}
          <div className="space-y-6">
            <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-blue-400">予定を登録</h2>
              <form onSubmit={addSchedule} className="space-y-4">
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 rounded bg-white text-black font-bold outline-none border-2 border-transparent focus:border-blue-400"
                  placeholder="タイトル"
                />
                <textarea 
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2 rounded bg-white text-black font-medium outline-none h-20 border-2 border-transparent focus:border-blue-400"
                  placeholder="詳細"
                />
                <button className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition shadow-lg active:scale-95 text-white">
                  {format(selectedDay, 'MM/dd', { locale: ja })} に追加
                </button>
              </form>
            </div>

            <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 min-h-75 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-blue-400">本日の詳細</h2>
              <div className="space-y-3">
                {daySchedules.length > 0 ? (
                  daySchedules.map(item => (
                    <div key={item.id} className="p-4 rounded bg-[#334155] border-l-4 border-blue-500 shadow-md">
                      <div className="font-black text-white text-lg">{item.title}</div>
                      <div className="text-sm text-slate-300 whitespace-pre-wrap">{item.description}</div>
                    </div>
                  ))
                ) : <p className="text-slate-500 italic text-center py-10">予定なし</p>}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}

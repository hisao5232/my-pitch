'use client'
import React, { useEffect, useState } from 'react'
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
import { ChevronLeft, ChevronRight, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Schedule = {
  id: number; title: string; description: string; date: string;
}

export default function Home() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [conditions, setConditions] = useState<any[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  // 編集中のスケジュールを保持（null の時はモーダルを閉じる）
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  // 編集用の一時的な入力値
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // 環境変数の取得を1箇所にまとめるとスッキリします
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

  // --- スケジュール取得 ---
  const fetchSchedules = () => {
    fetch(`${API_URL}/api/schedules`)
      .then(res => res.json())
      .then(setSchedules)
      .catch(err => console.error("Fetch error:", err))
  }

  // --- コンディション取得 ---
  const fetchConditions = () => {
    fetch(`${API_URL}/api/conditions`)
      .then(res => res.json())
      .then(data => {
        const formattedData = data.map((item: any) => ({
          ...item,
          date: format(new Date(item.date), 'MM/dd')
        }));
        setConditions(formattedData);
      })
      .catch(err => console.error("Fetch conditions error:", err));
  }

  // 初回読み込み
  useEffect(() => { 
    fetchSchedules();
    fetchConditions(); 
  }, [])

  // --- コンディション登録 ---
  const addCondition = async () => {
    if (!weight || !bodyFat) return;
    
    const res = await fetch(`${API_URL}/api/conditions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weight: parseFloat(weight),
        fat: parseFloat(bodyFat),
        date: format(selectedDay, 'yyyy-MM-dd')
      })
    });

    if (res.ok) {
      setWeight('');
      setBodyFat('');
      alert(`${format(selectedDay, 'M月d日')}の記録を保存しました！`);
      fetchConditions(); // 再読み込みしてグラフを更新
    }
  };

  // --- スケジュール追加 ---
  const addSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    // newTitle が空、または selectedDay が無い場合は処理しない
    if (!newTitle || !selectedDay) return;

    const res = await fetch(`${API_URL}/api/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        description: newDescription,
        date: format(selectedDay, 'yyyy-MM-dd')
      })
    });

    if (res.ok) {
      setNewTitle('');
      setNewDescription('');
      fetchSchedules(); 
    }
  };

  // 編集モーダルを開く
  const openEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setEditTitle(schedule.title);
    setEditDescription(schedule.description);
  };

  // スケジュールを更新
  const updateSchedule = async () => {
    if (!editingSchedule) return;
    const res = await fetch(`${API_URL}/api/schedules/${editingSchedule.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
        date: editingSchedule.date
      })
    });
    if (res.ok) {
      setEditingSchedule(null);
      fetchSchedules();
    }
  };

  // スケジュールを削除
  const deleteSchedule = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    const res = await fetch(`${API_URL}/api/schedules/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      setEditingSchedule(null);
      fetchSchedules();
    }
  };

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const selectedDateStr = format(selectedDay, 'yyyy-MM-dd')
  const daySchedules = schedules.filter(s => s.date === selectedDateStr)

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8">
      <div className="max-w-350 mx-auto">
        
        <h1 className="text-3xl font-bold mb-8 text-blue-400 flex items-center gap-2">
          ⚽ MyPitch Dash
        </h1>
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          <div className="xl:col-span-3 space-y-8">
            {/* --- カレンダー本体 --- */}
            <div className="bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
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

              <div className="grid grid-cols-7 border-b border-slate-700 bg-slate-800/30">
                {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                  <div key={day} className={`py-4 text-center text-sm font-black border-r last:border-r-0 border-slate-700/50 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}>
                    {day}
                  </div>
                ))}
              </div>

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
                      className={`min-h-32 p-2 border-r border-b border-slate-700/50 transition-all cursor-pointer relative
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

            {/* --- コンディションログ（グラフ & 入力） --- */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                <Activity size={28} /> コンディションログ
              </h2>
              
              {/* 入力フォーム */}
              <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl">
                <form className="flex flex-wrap items-end gap-6">
                  <div className="flex-1 min-w-40">
                    <label className="block text-sm text-slate-400 mb-2 font-bold">体重 (kg)</label>
                    <input 
                      type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)}
                      className="w-full p-3 rounded bg-slate-800 text-white font-bold border-2 border-slate-700 focus:border-blue-500 outline-none transition"
                      placeholder="65.0"
                    />
                  </div>
                  <div className="flex-1 min-w-40">
                    <label className="block text-sm text-slate-400 mb-2 font-bold">体脂肪率 (%)</label>
                    <input 
                      type="number" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)}
                      className="w-full p-3 rounded bg-slate-800 text-white font-bold border-2 border-slate-700 focus:border-blue-500 outline-none transition"
                      placeholder="12.0"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={addCondition} 
                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition active:scale-95"
                  >
                    {format(selectedDay, 'M/d')} のコンディションを記録
                  </button>
                </form>
              </div>

              {/* グラフ表示 */}
              <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-xl min-h-80">
                <h3 className="text-sm font-bold text-slate-400 mb-6">最近の推移（体重・体脂肪率）</h3>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={conditions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" domain={['dataMin - 1', 'dataMax + 1']} stroke="#60a5fa" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" domain={['dataMin - 1', 'dataMax + 1']} stroke="#34d399" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Line yAxisId="left" type="monotone" dataKey="weight" name="体重" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                      <Line yAxisId="right" type="monotone" dataKey="fat" name="体脂肪率" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* --- 右サイドバー：入力 & 詳細 --- */}
          <div className="space-y-6">
            <div className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-blue-400">予定を登録</h2>
              <form onSubmit={addSchedule} className="space-y-4">
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 rounded bg-white text-black font-bold outline-none border-2 border-transparent focus:border-blue-400" placeholder="タイトル" />
                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2 rounded bg-white text-black font-medium outline-none h-20 border-2 border-transparent focus:border-blue-400" placeholder="詳細" />
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
                    // ここに 「group」と「relative」を追加します
                    <div key={item.id} className="p-4 rounded bg-[#334155] border-l-4 border-blue-500 shadow-md group relative">
                      <div className="font-black text-white text-lg">{item.title}</div>
                      <div className="text-sm text-slate-300 whitespace-pre-wrap">{item.description}</div>
                      
                      {/* ボタン部分：absoluteで右上に固定 */}
                      <button 
                        onClick={() => openEditModal(item)}
                        className="absolute top-2 right-2 p-1 px-2 bg-blue-600 hover:bg-blue-500 rounded text-xs text-white font-bold"
                      >
                        編集
                      </button>
                    </div>
                  ))
                ) : <p className="text-slate-500 italic text-center py-10">予定なし</p>}
              </div>
            </div>
          </div>

        </div>
      </div>
      {/* --- ここからモーダルのコード --- */}
      {editingSchedule && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-[#1e293b] w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl">
            <h2 className="text-xl mb-4 text-blue-400 font-bold">予定を編集</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-bold">タイトル</label>
                <input 
                  className="w-full p-3 rounded bg-white text-black font-bold outline-none border-2 border-transparent focus:border-blue-500"
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-bold">詳細</label>
                <textarea 
                  className="w-full p-3 rounded bg-white text-black font-medium h-32 outline-none border-2 border-transparent focus:border-blue-500"
                  value={editDescription} 
                  onChange={(e) => setEditDescription(e.target.value)} 
                />
              </div>
              <div className="flex gap-2 pt-2 text-white">
                <button 
                  onClick={updateSchedule} 
                  className="flex-1 bg-blue-600 hover:bg-blue-500 py-3 rounded-lg font-bold transition shadow-lg active:scale-95"
                >
                  更新する
                </button>
                <button 
                  onClick={() => deleteSchedule(editingSchedule.id)} 
                  className="bg-red-600 hover:bg-red-500 px-6 rounded-lg font-bold transition shadow-lg active:scale-95"
                >
                  削除
                </button>
                <button 
                  onClick={() => setEditingSchedule(null)} 
                  className="bg-slate-600 hover:bg-slate-500 px-6 rounded-lg font-bold transition"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

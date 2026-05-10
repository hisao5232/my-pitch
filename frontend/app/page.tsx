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

type Schedule = { id: number; title: string; description: string; date: string; category?: string; };
type LinkItem = { id: number; title: string; url: string; };
type VideoItem = { id: number; title: string; url: string; category: string; };

export default function Home() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [conditions, setConditions] = useState<any[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date>(new Date())
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newCategory, setNewCategory] = useState('通知なし');
  const [holidays, setHolidays] = useState<string[]>([]);
  // 環境変数の取得
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

  // --- リンク取得 ---
  const fetchLinks = () => {
    fetch(`${API_URL}/api/links`)
      .then(res => res.json())
      .then(setLinks);
  };

  // --- リンク追加 ---
  const addLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle || !newLinkUrl) return;
    const res = await fetch(`${API_URL}/api/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newLinkTitle, url: newLinkUrl })
    });
    if (res.ok) {
      setNewLinkTitle('');
      setNewLinkUrl('');
      fetchLinks();
    }
  };
  
  // --- リンク削除 ---
  const deleteLink = async (id: number) => {
    await fetch(`${API_URL}/api/links/${id}`, { method: 'DELETE' });
    fetchLinks();
  };

  // 動画取得
  const fetchVideos = () => {
  fetch(`${API_URL}/api/videos`)
    .then(res => res.json())
    .then(setVideos);
  };

  // YouTube URLを埋め込み用に変換する関数
const getEmbedUrl = (url: string) => {
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('watch?v=', 'embed/');
  } else if (url.includes('youtu.be/')) {
    return url.replace('youtu.be/', 'www.youtube.com/embed/');
  }
  return url; // YouTube以外はそのまま
};

  // 動画追加
  const addVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle || !newVideoUrl) return;
    const res = await fetch(`${API_URL}/api/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newVideoTitle, url: newVideoUrl, category: 'サッカー' })
    });
    if (res.ok) {
      setNewVideoTitle('');
      setNewVideoUrl('');
      fetchVideos();
    }
  };

  // 初回読み込み
  useEffect(() => { 
    fetchSchedules();
    fetchConditions(); 
    fetchLinks();
    fetchVideos();
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
    if (!newTitle || !selectedDay) return;

    const res = await fetch(`${API_URL}/api/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        description: newDescription,
        date: format(selectedDay, 'yyyy-MM-dd'),
        category: newCategory // ← 追加
      })
    });

    if (res.ok) {
      setNewTitle('');
      setNewDescription('');
      setNewCategory('通知なし'); // ← リセット
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
    } else {
    alert("更新に失敗しました");
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
    }else {
    alert("削除に失敗しました");
    }
  };

  // 休日の切り替え関数
  const toggleHoliday = (e: React.MouseEvent, dateStr: string) => {
    e.stopPropagation(); // マス自体のクリックイベント（選択）が発火しないようにする
    if (holidays.includes(dateStr)) {
      setHolidays(holidays.filter(d => d !== dateStr));
    } else {
      setHolidays([...holidays, dateStr]);
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
    <main className="min-h-screen bg-[#0a0f1e] text-slate-300 p-4 md:p-8 font-mono">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER: App Logo & Status --- */}
        <header className="mb-10 border-b-4 border-double border-slate-700 pb-4">
          <h1 className="text-4xl font-black tracking-tighter text-emerald-500 flex items-center gap-3">
            <span className="bg-emerald-500 text-[#0a0f1e] px-2 py-0.5 rounded">MY</span>
            PITCH <span className="text-slate-500 text-lg font-light tracking-widest ml-2 uppercase italic">Tactical Dashboard v2.0</span>
          </h1>
        </header>
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
          
          {/* --- MAIN COLUMN: Calendar & Analysis --- */}
          <div className="xl:col-span-3 space-y-12">

            {/* １．カレンダーブロック */}
            <section className="bg-[#111827] rounded-sm shadow-2xl border-t-2 border-l-2 border-slate-700 relative">
              {/* 装飾用の角パーツ */}
              <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-emerald-500/50"></div>
              
              <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
                <h2 className="text-xl font-black text-white underline decoration-emerald-500 decoration-4 underline-offset-8">
                  {format(currentMonth, 'yyyy / MM', { locale: ja })}
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 bg-slate-800 hover:bg-emerald-600 rounded-md transition-all text-white border border-slate-600">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 bg-slate-800 hover:bg-emerald-600 rounded-md transition-all text-white border border-slate-600">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* 曜日ヘッダー */}
              <div className="grid grid-cols-7 bg-slate-900/80">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
                  <div key={day} className={`py-3 text-center text-[10px] font-bold tracking-widest border-r border-slate-800 last:border-r-0 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-500'}`}>
                    {day}
                  </div>
                ))}
              </div>

              {/* カレンダーグリッド */}
              <div className="grid grid-cols-7 border-t border-slate-800">
                {calendarDays.map((date, i) => {
                  const dateStr = format(date, 'yyyy-MM-dd')
                  const dateSchedules = schedules.filter(s => s.date === dateStr)
                  const isSelected = isSameDay(date, selectedDay)
                  const isCurrentMonth = isSameMonth(date, monthStart)
                  const isToday = isSameDay(date, new Date())
  
                  // 休日の判定
                  const isHoliday = holidays.includes(dateStr)

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDay(date)}
                      className={`min-h-30 p-2 border-r border-b border-slate-800/80 transition-all cursor-pointer relative group
                        ${!isCurrentMonth ? 'bg-black/40 opacity-30' : 'hover:bg-emerald-900/10'}
                        ${isSelected ? 'bg-emerald-900/20 ring-1 ring-inset ring-emerald-500/50' : ''}
                        ${isHoliday ? 'bg-red-950/40' : ''} 
                        ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}
                      `}
                    >
                      {/* --- 休日ボタン --- */}
                      <button
                        onClick={(e) => toggleHoliday(e, dateStr)}
                        className={`absolute top-1 right-1 w-4 h-4 rounded-full border transition-all flex items-center justify-center
                          ${isHoliday 
                            ? 'bg-red-600 border-red-400 scale-110 shadow-[0_0_8px_rgba(220,38,38,0.6)]' 
                            : 'bg-slate-800 border-slate-700 opacity-0 group-hover:opacity-100 hover:bg-red-900'
                          }`}
                      >
                        <span className="text-[8px] text-white font-black">{isHoliday ? 'OFF' : ''}</span>
                      </button>

                      <div className="flex flex-col">
                        <span className={`text-sm font-bold w-fit
                          ${isToday ? 'bg-emerald-500 text-black px-1' : ''}
                          ${isHoliday ? 'text-red-400' : 'text-slate-300'}
                        `}>
                          {format(date, 'd')}
                        </span>
                        
                        {/* 休日時のラベル表示（オプション） */}
                        {isHoliday && (
                          <span className="text-[8px] font-black text-red-600 tracking-tighter mt-0.5">OFF_DUTY</span>
                        )}
                      </div>

                      <div className="mt-2 space-y-1">
                        {dateSchedules.map(s => (
                          <div 
                            key={s.id} 
                            className={`text-[9px] uppercase font-bold px-1 py-0.5 rounded-sm truncate
                              ${s.category === '通知あり' 
                                ? 'bg-red-950/80 text-red-400 border border-red-800' 
                                : 'bg-slate-800/80 text-emerald-400 border border-emerald-900/50'
                              }`}
                          >
                            {s.category === '通知あり' && '!' } {s.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* BLOCK 2: CONDITION ANALYTICS */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
                <Activity size={24} className="text-emerald-500" />
                <h2 className="text-2xl font-black tracking-tighter uppercase italic">Physical Analytics</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Input Form */}
                <div className="md:col-span-1 bg-[#111827] p-6 border border-slate-800 rounded-sm shadow-xl">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Weight (kg)</label>
                      <input 
                        type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)}
                        className="w-full p-2 bg-black border border-slate-700 focus:border-emerald-500 outline-none text-white font-bold"
                        placeholder="00.0"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Body Fat (%)</label>
                      <input 
                        type="number" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)}
                        className="w-full p-2 bg-black border border-slate-700 focus:border-emerald-500 outline-none text-white font-bold"
                        placeholder="00.0"
                      />
                    </div>
                    <button 
                      onClick={addCondition} 
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-[#0a0f1e] py-3 font-black text-sm uppercase tracking-tighter transition-all active:translate-y-1 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.2)]"
                    >
                      Log Status ({format(selectedDay, 'MM/dd')})
                    </button>
                  </div>
                </div>

                {/* Graph Visualization */}
                <div className="md:col-span-2 bg-[#111827] p-6 border border-slate-800 rounded-sm shadow-xl">
                  <h3 className="text-[10px] font-bold text-slate-500 mb-6 uppercase tracking-widest border-b border-dashed border-slate-700 pb-2">Growth Chart / Performance Curve</h3>
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={conditions}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                        <XAxis dataKey="date" stroke="#4b5563" tick={{ fontSize: 10 }} axisLine={false} />
                        <YAxis yAxisId="left" domain={['dataMin - 1', 'dataMax + 1']} hide />
                        <Tooltip contentStyle={{ backgroundColor: '#0a0f1e', border: '1px solid #334155' }} />
                        <Line yAxisId="left" type="stepAfter" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                        <Line yAxisId="left" type="monotone" dataKey="fat" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* --- SIDEBAR: Ops & Intelligence --- */}
          <aside className="space-y-8">

            {/* SIDE BLOCK 1: ENTRY FORM */}
            <div className="bg-[#111827] p-6 border-b-4 border-emerald-500 shadow-2xl">
              <h2 className="text-lg font-black mb-6 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 animate-pulse"></span> Mission Entry
              </h2>
              <form onSubmit={addSchedule} className="space-y-4">
                <div className="group">
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Category</label>
                  <select 
                    value={newCategory} 
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 bg-slate-900 border border-slate-700 text-emerald-400 font-bold focus:border-emerald-500 outline-none appearance-none"
                  >
                    <option value="通知なし">STANDARD</option>
                    <option value="通知あり">URGENT / NOTIFY</option>
                  </select>
                </div>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 bg-transparent border-b-2 border-slate-700 focus:border-emerald-500 outline-none text-white font-bold placeholder:text-slate-700" placeholder="MISSION TITLE" />
                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2 bg-slate-900/50 border border-slate-800 text-sm h-24 focus:border-emerald-500 outline-none text-slate-400" placeholder="Details and tactical notes..." />
                <button className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-500 border border-emerald-500/50 py-3 font-bold text-xs uppercase tracking-[0.2em] transition-all">
                  Add to Briefing
                </button>
              </form>
            </div>

            {/* SIDE BLOCK 2: DAILY BRIEFING */}
            <div className="bg-transparent border border-slate-800 p-6 shadow-lg">
              <h2 className="text-lg font-black mb-4 uppercase italic text-slate-400">Daily Briefing</h2>
              <div className="space-y-4">
                {daySchedules.length > 0 ? (
                  daySchedules.map((item: Schedule) => (
                    <div key={item.id} className="p-4 bg-slate-900/40 border border-slate-800 border-l-4 border-l-emerald-600 group relative">
                      <div className="font-bold text-white text-md uppercase tracking-tight">{item.title}</div>
                      <div className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</div>
                      <button 
                        onClick={() => openEditModal(item)}
                        className="absolute -top-2 -right-2 bg-emerald-500 text-[#0a0f1e] p-1 px-2 text-[8px] font-black opacity-0 group-hover:opacity-100 transition-all"
                      >
                        EDIT_UNIT
                      </button>
                    </div>
                  ))
                ) : <p className="text-slate-700 text-xs font-bold tracking-widest text-center py-6 border border-dashed border-slate-800">NO MISSIONS PLANNED</p>}
              </div>
            </div>

            {/* お気に入りのリンク */}
            <div className="bg-[#111827] p-6 border border-slate-800">
              <h2 className="text-[10px] font-black mb-4 uppercase tracking-[0.3em] text-emerald-500">Intelligence Source</h2>
              
              {/* 追加フォーム */}
              <div className="mb-6 p-3 bg-black/40 border border-slate-800 rounded-sm">
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="SOURCE TITLE" 
                    value={newLinkTitle} 
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="w-full bg-transparent border-b border-slate-700 text-[10px] font-bold text-white outline-none focus:border-emerald-500 placeholder:text-slate-800 transition-colors"
                  />
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      placeholder="HTTPS://..." 
                      value={newLinkUrl} 
                      onChange={(e) => setNewLinkUrl(e.target.value)}
                      className="flex-1 bg-transparent border-b border-slate-700 text-[10px] text-slate-400 outline-none focus:border-emerald-500 placeholder:text-slate-800 transition-colors"
                    />
                    <button 
                      onClick={addLink} 
                      className="bg-emerald-950 text-emerald-500 border border-emerald-900 px-3 py-1 text-[10px] font-black hover:bg-emerald-500 hover:text-black transition-all"
                    >
                      PATCH
                    </button>
                  </div>
                </div>
              </div>

              {/* Link List */}
              <div className="space-y-1">
                {links.length > 0 ? (
                  links.map(link => (
                    <div key={link.id} className="flex items-center justify-between group border-b border-slate-800/50 py-2 hover:bg-slate-900/30 px-1 transition-colors">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-400 transition-colors truncate italic">
                        {link.title}
                      </a>
                      <button 
                        onClick={() => deleteLink(link.id)} 
                        className="text-[9px] text-red-900 font-bold hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        [X]
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-[9px] text-slate-800 font-bold tracking-widest text-center py-2 uppercase">No data link established</div>
                )}
              </div>
            </div>

            {/* SIDE BLOCK 4: TRAINING ARCHIVE (Videos) */}
            <div className="bg-black/50 p-4 border-2 border-dashed border-slate-800">
              <h2 className="text-sm font-black mb-4 uppercase text-orange-500">Training Film</h2>
              <div className="grid grid-cols-1 gap-4">
                {videos.map(video => (
                  <div key={video.id} className="bg-[#0a0f1e] p-2 border border-slate-800">
                    <div className="text-[9px] font-bold text-slate-500 mb-1 truncate">FILE: {video.title}</div>
                    <div className="relative aspect-video grayscale hover:grayscale-0 transition-all duration-500">
                      <iframe
                        src={getEmbedUrl(video.url)}
                        title={video.title}
                        className="absolute w-full h-full"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>          
        </div>
      </div>

      {/* --- MODAL: Tactical Re-assignment --- */}
      {editingSchedule && (
        <div className="fixed inset-0 bg-[#0a0f1e]/90 backdrop-blur-md flex items-center justify-center z-100 p-4">
          <div className="bg-[#111827] w-full max-w-md p-8 border-t-4 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
            <h2 className="text-2xl font-black mb-6 text-white uppercase italic tracking-tighter">Edit Mission</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Objective Title</label>
                <input 
                  className="w-full p-3 bg-black border border-slate-700 text-emerald-400 font-bold outline-none focus:border-emerald-500"
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Strategic Details</label>
                <textarea 
                  className="w-full p-3 bg-black border border-slate-700 text-slate-400 text-sm h-32 outline-none focus:border-emerald-500"
                  value={editDescription} 
                  onChange={(e) => setEditDescription(e.target.value)} 
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button onClick={updateSchedule} className="bg-emerald-600 hover:bg-emerald-500 text-[#0a0f1e] py-3 font-black text-sm uppercase">
                  Confirm
                </button>
                <button onClick={() => deleteSchedule(editingSchedule.id)} className="bg-red-950 text-red-500 border border-red-900 py-3 font-bold text-sm uppercase">
                  Abort Unit
                </button>
                <button onClick={() => setEditingSchedule(null)} className="col-span-2 bg-slate-800 text-slate-400 py-2 font-bold text-xs uppercase tracking-widest mt-2 hover:bg-slate-700">
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

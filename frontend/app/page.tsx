'use client'
import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'

import { useCalendar } from './hooks/useCalendar'
import { useSchedules } from './hooks/useSchedules'
import { useConditions } from './hooks/useConditions'
import { useLinks } from './hooks/useLinks'
import { useVideos } from './hooks/useVideos'
import { useGarbage } from './hooks/useGarbage'

import Calendar from './components/Calendar'
import ConditionChart from './components/ConditionChart'
import SchedulePanel from './components/SchedulePanel'
import LinkList from './components/LinkList'
import VideoList from './components/VideoList'
import EditModal from './components/EditModal'
import TwitterTimeline from './components/TwitterTimeline'

import { Schedule } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787'

export default function Home() {
  const {
    currentMonth,
    monthStart,
    selectedDay,
    setSelectedDay,
    holidays,
    calendarDays,
    goToPrevMonth,
    goToNextMonth,
    toggleHoliday,
  } = useCalendar()

  const { schedules, fetchSchedules, addSchedule, updateSchedule, deleteSchedule } =
    useSchedules(API_URL)
  const { conditions, fetchConditions, addCondition } = useConditions(API_URL)
  const { links, fetchLinks, addLink, deleteLink } = useLinks(API_URL)
  const { videos, fetchVideos, addVideo, getEmbedUrl } = useVideos(API_URL)
  const { garbageDays, fetchGarbageData, setGarbage } = useGarbage(API_URL)

  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)

  useEffect(() => {
    fetchSchedules()
    fetchConditions()
    fetchLinks()
    fetchVideos()
    fetchGarbageData()
  }, [])

  const selectedDateStr = format(selectedDay, 'yyyy-MM-dd')
  const daySchedules = schedules.filter(s => s.date === selectedDateStr)

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-slate-300 p-4 md:p-8 font-mono">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="mb-10 border-b-4 border-double border-slate-700 pb-4">
          <h1 className="text-4xl font-black tracking-tighter text-emerald-500 flex items-center gap-3">
            <span className="bg-emerald-500 text-[#0a0f1e] px-2 py-0.5 rounded">MY</span>
            PITCH{' '}
            <span className="text-slate-500 text-lg font-light tracking-widest ml-2 uppercase italic">
              Tactical Dashboard v2.0
            </span>
          </h1>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">

          {/* MAIN COLUMN */}
          <div className="xl:col-span-3 space-y-12">
            <Calendar
              currentMonth={currentMonth}
              monthStart={monthStart}
              selectedDay={selectedDay}
              calendarDays={calendarDays}
              holidays={holidays}
              schedules={schedules}
              garbageDays={garbageDays}
              onSelectDay={setSelectedDay}
              onPrevMonth={goToPrevMonth}
              onNextMonth={goToNextMonth}
              onToggleHoliday={toggleHoliday}
              onSetGarbage={setGarbage}
            />

            <ConditionChart
              conditions={conditions}
              selectedDay={selectedDay}
              onAddCondition={addCondition}
            />
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-8">
            <SchedulePanel
              selectedDay={selectedDay}
              daySchedules={daySchedules}
              onAddSchedule={addSchedule}
              onOpenEditModal={setEditingSchedule}
            />

            <LinkList
              links={links}
              onAddLink={addLink}
              onDeleteLink={deleteLink}
            />

            <VideoList
              videos={videos}
              onAddVideo={addVideo}
              getEmbedUrl={getEmbedUrl}
            />

            <TwitterTimeline />
          </aside>
        </div>
      </div>

      <EditModal
        schedule={editingSchedule}
        onUpdate={updateSchedule}
        onDelete={deleteSchedule}
        onClose={() => setEditingSchedule(null)}
      />
    </main>
  )
}

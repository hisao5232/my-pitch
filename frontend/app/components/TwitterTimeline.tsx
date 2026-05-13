'use client'

import Script from 'next/script'

export default function TwitterTimeline() {
  return (
    <div className="bg-[#111827] p-4 border border-slate-800 rounded-lg">
      <h2 className="text-[10px] font-black mb-4 uppercase tracking-[0.3em] text-sky-500">
        Twitter Feed
      </h2>

      {/* Elfsight Widget Body */}
      <div 
        className="elfsight-app-d3544b36-d8cd-401e-be4d-0b0302d12d21" 
        data-elfsight-app-lazy 
      />

      {/* 
        Elfsight Script 
        srcは提供された 'https://elfsightcdn.com/platform.js' を使用します
      */}
      <Script 
        src="https://elfsightcdn.com/platform.js" 
        strategy="lazyOnload" 
      />
    </div>
  )
}

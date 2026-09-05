import React from 'react'

const PLACEHOLDER_INSIGHTS = [
  'Ринок активний. Є кілька крупних гравців, на яких можна рівнятися',
  'Стратегія виходу новичків на ринок: через відео-креативи та Instagram-воронку',
  'Більшість конкурентів використовують CTA "Send message" — прямий контакт працює краще за лендінги',
  'Топові реклами тримаються 500+ днів — довгострокові креативи ефективніші за часту ротацію',
]

export function StrategicInsights() {
  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <div className="border-b p-4">
        <h2 className="text-lg text-left font-semibold text-slate-800">Strategic Insights</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 p-4">
        {PLACEHOLDER_INSIGHTS.map((text) => (
          <div
            key={text}
            className="rounded-xl border-l-4 border-blue-400 bg-blue-50 p-4"
          >
            <p className="text-sm text-slate-700 text-left">{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

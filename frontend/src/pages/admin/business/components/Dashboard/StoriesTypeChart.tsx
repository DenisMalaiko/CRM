import React from 'react'

type Props = {
  storiesImageCount: number
  storiesVideoCount: number
}

type LegendItem = {
  label: string
  count: number
  color: string
}

export function StoriesTypeChart({ storiesImageCount, storiesVideoCount }: Props) {
  const total = storiesImageCount + storiesVideoCount

  if (total === 0) {
    return (
      <div className="rounded-2xl bg-white shadow border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 text-left">Stories Formats (90D)</h3>
        <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
      </div>
    )
  }

  const imagePct = Math.round((storiesImageCount / total) * 100)

  const gradient = `conic-gradient(#3b82f6 0% ${imagePct}%, #8b5cf6 ${imagePct}% 100%)`

  const items: LegendItem[] = [
    { label: 'Image', count: storiesImageCount, color: '#3b82f6' },
    { label: 'Video', count: storiesVideoCount, color: '#8b5cf6' },
  ]

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 text-left">Stories Formats (90D)</h3>

      <div className="flex flex-col items-center gap-4">
        <div className="relative flex-shrink-0">
          <div
            className="w-40 h-40 rounded-full"
            style={{ background: gradient }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
              <span className="text-xl font-bold text-slate-800">{total}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-slate-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

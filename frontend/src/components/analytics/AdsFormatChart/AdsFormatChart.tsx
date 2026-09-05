import React from 'react'

type Props = {
  adsVideoCount: number
  adsImageCount: number
  adsCarouselCount: number
  adsDcoCount: number
}

type LegendItem = {
  label: string
  count: number
  bgClass: string
}

export function AdsFormatChart({ adsVideoCount, adsImageCount, adsCarouselCount, adsDcoCount }: Props) {
  const total = adsVideoCount + adsImageCount + adsCarouselCount + adsDcoCount

  if (total === 0) {
    return (
      <div className="rounded-2xl bg-white shadow border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 text-left">Ads Formats</h3>
        <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
      </div>
    )
  }

  const imagePct = Math.round((adsImageCount / total) * 100)
  const videoPct = Math.round((adsVideoCount / total) * 100)
  const carouselPct = Math.round((adsCarouselCount / total) * 100)

  const imageStop = imagePct
  const videoStop = imageStop + videoPct
  const carouselStop = videoStop + carouselPct

  const gradient = `conic-gradient(#3b82f6 0% ${imageStop}%, #8b5cf6 ${imageStop}% ${videoStop}%, #6b7280 ${videoStop}% ${carouselStop}%, #f59e0b ${carouselStop}% 100%)`

  const items: LegendItem[] = [
    { label: 'Image', count: adsImageCount, bgClass: 'bg-blue-500' },
    { label: 'Video', count: adsVideoCount, bgClass: 'bg-violet-500' },
    { label: 'Carousel', count: adsCarouselCount, bgClass: 'bg-gray-500' },
    { label: 'DCO', count: adsDcoCount, bgClass: 'bg-amber-500' },
  ]

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 text-left">Ads Formats</h3>

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
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${item.bgClass}`} />
              <span className="text-sm text-slate-600">{item.label}: {item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

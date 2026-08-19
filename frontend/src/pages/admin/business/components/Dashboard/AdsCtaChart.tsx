import React from 'react'

type Props = {
  adsCtaWebsite: number
  adsCtaDirectMessage: number
  adsCtaInstagramPage: number
  adsCtaProduct: number
  adsCtaMetaPage: number
}

type LegendItem = {
  label: string
  count: number
  bgClass: string
  color: string
}

export function AdsCtaChart({ adsCtaWebsite, adsCtaDirectMessage, adsCtaInstagramPage, adsCtaProduct, adsCtaMetaPage }: Props) {
  const total = adsCtaWebsite + adsCtaDirectMessage + adsCtaInstagramPage + adsCtaProduct + adsCtaMetaPage

  if (total === 0) {
    return (
      <div className="rounded-2xl bg-white shadow border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 text-left">Ads CTA Types</h3>
        <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
      </div>
    )
  }

  const items: LegendItem[] = [
    { label: 'Website', count: adsCtaWebsite, bgClass: 'bg-emerald-500', color: '#10b981' },
    { label: 'Direct Message', count: adsCtaDirectMessage, bgClass: 'bg-amber-400', color: '#fbbf24' },
    { label: 'Instagram Page', count: adsCtaInstagramPage, bgClass: 'bg-blue-500', color: '#3b82f6' },
    { label: 'Product', count: adsCtaProduct, bgClass: 'bg-violet-500', color: '#8b5cf6' },
    { label: 'Meta Page', count: adsCtaMetaPage, bgClass: 'bg-gray-500', color: '#6b7280' },
  ]

  const stops: string[] = []
  let cumulative = 0
  for (const item of items) {
    const start = cumulative
    cumulative += Math.round((item.count / total) * 100)
    stops.push(`${item.color} ${start}% ${cumulative}%`)
  }

  const gradient = `conic-gradient(${stops.join(', ')})`

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 text-left">Ads CTA Types</h3>

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

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
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

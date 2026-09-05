import React, { useMemo } from 'react'
import { TCompetitorWithReport } from '../../../models/Competitor'

type Props = {
  competitors: TCompetitorWithReport[]
}

type CtaItem = {
  label: string
  count: number
}

export function CompetitorCtaBlock({ competitors }: Props) {
  const ctaItems = useMemo<CtaItem[]>(() => {
    let website = 0
    let directMessage = 0
    let instagramPage = 0
    let product = 0
    let metaPage = 0

    for (const competitor of competitors) {
      const report = competitor.facebookReport
      if (!report) continue
      website += report.adsCtaWebsite
      directMessage += report.adsCtaDirectMessage
      instagramPage += report.adsCtaInstagramPage
      product += report.adsCtaProduct
      metaPage += report.adsCtaMetaPage
    }

    return [
      { label: 'Website', count: website },
      { label: 'Direct Message', count: directMessage },
      { label: 'Instagram Page', count: instagramPage },
      { label: 'Product', count: product },
      { label: 'Meta Page', count: metaPage },
    ].sort((a, b) => b.count - a.count)
  }, [competitors])

  const maxCount = useMemo(() => Math.max(...ctaItems.map((item) => item.count), 1), [ctaItems])
  const total = useMemo(() => ctaItems.reduce((sum, item) => sum + item.count, 0), [ctaItems])

  if (total === 0) return null

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <div className="border-b p-4">
        <h2 className="text-lg text-left font-semibold text-slate-800">Call-to-Actions</h2>
      </div>
      <div className="p-4 space-y-3">
        {ctaItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-sm text-slate-600 w-32 text-right flex-shrink-0">{item.label}</span>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-6 rounded bg-slate-100">
                <div
                  className="h-full rounded bg-blue-500"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 w-8 text-right">{item.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

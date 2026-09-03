import React from 'react'
import { ExternalLink } from 'lucide-react'

type TopAdItem = {
  competitorName: string
  text: string
  collationCount: number
  url: string | null
}

type Props = {
  ads: TopAdItem[]
}

export function TopAdTexts({ ads }: Props) {
  if (ads.length === 0) return null

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <div className="border-b p-4">
        <h2 className="text-lg text-left font-semibold text-slate-800">Top Ad Texts</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 p-4">
        {ads.map((ad, index) => (
          <div key={`${ad.competitorName}-${index}`} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              {ad.url ? (
                <a
                  href={ad.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {ad.competitorName}
                  <ExternalLink size={14} />
                </a>
              ) : (
                <p className="text-sm font-semibold text-slate-800">{ad.competitorName}</p>
              )}
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                {ad.collationCount} {ad.collationCount === 1 ? 'copy' : 'copies'}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-2 text-left whitespace-pre-line">{ad.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

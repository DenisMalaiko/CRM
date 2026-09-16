import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TBusiness } from '../../../../../models/Business'

type Props = {
  businesses: TBusiness[]
}

type LegendItem = {
  label: string
  count: number
  color: string
}

const INDUSTRY_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1',
]

export function BusinessStatusChart({ businesses }: Props) {
  const { t } = useTranslation()
  const total = businesses.length

  const { items, gradient } = useMemo(() => {
    if (total === 0) return { items: [], gradient: '' }

    const counts = new Map<string, number>()
    for (const biz of businesses) {
      const industry = biz.industry || 'Other'
      counts.set(industry, (counts.get(industry) ?? 0) + 1)
    }

    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])

    const legendItems: LegendItem[] = sorted.map(([label, count], i) => ({
      label,
      count,
      color: INDUSTRY_COLORS[i % INDUSTRY_COLORS.length],
    }))

    let gradientStop = 0
    const segments = legendItems.map((item) => {
      const pct = Math.round((item.count / total) * 100)
      const start = gradientStop
      gradientStop += pct
      return `${item.color} ${start}% ${gradientStop}%`
    })

    return {
      items: legendItems,
      gradient: `conic-gradient(${segments.join(', ')})`,
    }
  }, [businesses, total])

  if (total === 0) {
    return (
      <div className="rounded-2xl bg-white shadow border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 text-left">{t('Dashboard.industries')}</h3>
        <p className="text-sm text-slate-400 text-center py-8">{t('General.noDataYet')}</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 text-left">{t('Dashboard.industries')}</h3>

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

        <div className="flex flex-wrap justify-center gap-3">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-slate-600">{item.label} ({item.count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

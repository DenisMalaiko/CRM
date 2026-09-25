import React from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink } from 'lucide-react'
import { TCompetitorWithReport } from '../../../models/Competitor'

type Props = {
  competitors: TCompetitorWithReport[]
}

export function CompetitorInstagramTable({ competitors }: Props) {
  const { t } = useTranslation()
  if (competitors.length === 0) return null

  function handleOpenLink(url: string) {
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <div className="border-b p-4">
        <h2 className="text-lg text-left font-semibold text-slate-800">{t('BusinessDashboard.competitors')}</h2>
      </div>
      <div className="p-4">
        <table className="min-w-full divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 shadow">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">{t('General.name')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">{t('BusinessDashboard.followers')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">{t('BusinessDashboard.posts')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">{t('BusinessDashboard.reels')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">{t('BusinessDashboard.stories')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {competitors.map((c) => (
              <tr
                key={c.id}
                role="link"
                tabIndex={0}
                className="cursor-pointer bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => handleOpenLink(c.instagramLink)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleOpenLink(c.instagramLink)
                }}
              >
                <td className="px-4 py-3 text-left font-medium text-slate-900">
                  <span className="flex items-center gap-1.5">
                    {c.name}
                    <ExternalLink size={14} className="text-blue-500" />
                  </span>
                </td>
                <td className="px-4 py-3 text-left font-medium text-slate-900">{(c.instagramReport?.followers ?? 0).toLocaleString('uk-UA')}</td>
                <td className="px-4 py-3 text-left font-medium text-slate-900">{(c.instagramReport?.posts ?? 0).toLocaleString('uk-UA')}</td>
                <td className="px-4 py-3 text-left font-medium text-slate-900">{(c.instagramReport?.reels ?? 0).toLocaleString('uk-UA')}</td>
                <td className="px-4 py-3 text-left font-medium text-slate-900">{(c.instagramReport?.stories ?? 0).toLocaleString('uk-UA')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

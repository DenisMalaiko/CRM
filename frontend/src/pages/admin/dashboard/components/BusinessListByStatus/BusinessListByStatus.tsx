import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TBusiness } from '../../../../../models/Business'
import { BusinessStatus } from '../../../../../enum/BusinessStatus'

type Props = {
  businesses: TBusiness[]
}

type StatusConfig = {
  status: BusinessStatus
  titleKey: string
  badge: string
  emptyTextKey: string
}

const STATUS_CONFIGS: StatusConfig[] = [
  {
    status: BusinessStatus.Active,
    titleKey: 'Dashboard.statusActive',
    badge: 'bg-emerald-100 text-emerald-700',
    emptyTextKey: 'Dashboard.noActiveBusinesses',
  },
  {
    status: BusinessStatus.Paused,
    titleKey: 'Dashboard.statusPaused',
    badge: 'bg-amber-100 text-amber-700',
    emptyTextKey: 'Dashboard.noPausedBusinesses',
  },
  {
    status: BusinessStatus.Archived,
    titleKey: 'Dashboard.statusArchived',
    badge: 'bg-slate-100 text-slate-500',
    emptyTextKey: 'Dashboard.noArchivedBusinesses',
  },
]

export function BusinessListByStatus({ businesses }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const grouped = new Map<BusinessStatus, TBusiness[]>()
  for (const config of STATUS_CONFIGS) {
    grouped.set(config.status, businesses.filter((b) => b.status === config.status))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 px-4">
      {STATUS_CONFIGS.map((config) => {
        const list = grouped.get(config.status) ?? []

        return (
          <div key={config.status} className="rounded-2xl bg-white shadow border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">{t(config.titleKey)}</h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.badge}`}>
                {list.length}
              </span>
            </div>

            {list.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">{t(config.emptyTextKey)}</p>
            ) : (
              <ul className="space-y-2">
                {list.map((biz) => (
                  <li
                    key={biz.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                    onClick={() => navigate(`/profile/businesses/${biz.id}/dashboard`)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate text-left">{biz.name}</p>
                      {biz.industry && (
                        <p className="text-xs text-slate-400 truncate">{biz.industry}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}

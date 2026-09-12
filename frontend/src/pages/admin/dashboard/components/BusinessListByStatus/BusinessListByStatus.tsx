import React from 'react'
import { useNavigate } from 'react-router-dom'
import { TBusiness } from '../../../../../models/Business'
import { BusinessStatus } from '../../../../../enum/BusinessStatus'

type Props = {
  businesses: TBusiness[]
}

type StatusConfig = {
  status: BusinessStatus
  title: string
  badge: string
  emptyText: string
}

const STATUS_CONFIGS: StatusConfig[] = [
  {
    status: BusinessStatus.Active,
    title: 'Active',
    badge: 'bg-emerald-100 text-emerald-700',
    emptyText: 'No active businesses',
  },
  {
    status: BusinessStatus.Paused,
    title: 'Paused',
    badge: 'bg-amber-100 text-amber-700',
    emptyText: 'No paused businesses',
  },
  {
    status: BusinessStatus.Archived,
    title: 'Archived',
    badge: 'bg-slate-100 text-slate-500',
    emptyText: 'No archived businesses',
  },
]

export function BusinessListByStatus({ businesses }: Props) {
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
              <h3 className="text-lg font-semibold text-slate-800">{config.title}</h3>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.badge}`}>
                {list.length}
              </span>
            </div>

            {list.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">{config.emptyText}</p>
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

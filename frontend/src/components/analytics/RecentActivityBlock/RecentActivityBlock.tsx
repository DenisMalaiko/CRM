import React from "react"
import { formatDistanceToNow } from "date-fns"

export type ActivityItem = {
  id: string
  label: string
  type: string
  createdAt: string | Date
}

type Props = {
  recentActivity: ActivityItem[]
}

export function RecentActivityBlock({ recentActivity }: Props) {
  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="text-lg text-left font-semibold text-slate-800">Recent Activity</h2>
      </div>
      {recentActivity.length === 0 ? (
        <p className="p-4 text-sm text-slate-400">No recent activity</p>
      ) : (
        <div>
          {recentActivity.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-slate-700 text-left">{item.label}</p>
                <p className="text-xs text-slate-400 text-left">{item.type}</p>
              </div>
              <p className="text-xs text-slate-400">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

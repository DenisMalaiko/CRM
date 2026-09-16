import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'
import { TBusiness } from '../../../../../models/Business'

type Props = {
  businesses: TBusiness[]
}

type ChartDataPoint = {
  month: string
  total: number
}

const CHART_COLOR = '#3b82f6' // tailwind blue-500
const AXIS_TICK_STYLE = { fontSize: 12, fill: '#94a3b8' } // tailwind slate-400
const CHART_MARGIN = { top: 5, right: 20, bottom: 5, left: 0 }
const TOOLTIP_STYLE = {
  borderRadius: '8px',
  border: '1px solid #e2e8f0', // tailwind slate-200
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
}

function buildChartData(businesses: TBusiness[]): ChartDataPoint[] {
  if (businesses.length === 0) return []

  const sorted = [...businesses].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  const monthCounts = new Map<string, number>()

  for (const biz of sorted) {
    const month = format(parseISO(biz.createdAt), 'yyyy-MM')
    monthCounts.set(month, (monthCounts.get(month) ?? 0) + 1)
  }

  const months = Array.from(monthCounts.keys()).sort()
  const data: ChartDataPoint[] = []
  let cumulative = 0

  for (const month of months) {
    cumulative += monthCounts.get(month) ?? 0
    data.push({
      month: format(parseISO(`${month}-01`), 'MMM yyyy'),
      total: cumulative,
    })
  }

  return data
}

export function BusinessGrowthChart({ businesses }: Props) {
  const { t } = useTranslation()
  const data = useMemo(() => buildChartData(businesses), [businesses])

  if (data.length === 0) {
    return (
      <div className="rounded-2xl bg-white shadow border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 text-left">{t('Dashboard.businessGrowth')}</h3>
        <p className="text-sm text-slate-400 text-center py-8">{t('General.noDataYet')}</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 text-left">{t('Dashboard.businessGrowth')}</h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLOR} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            tick={AXIS_TICK_STYLE}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={AXIS_TICK_STYLE}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Area
            type="monotone"
            dataKey="total"
            stroke={CHART_COLOR}
            strokeWidth={2}
            fill="url(#colorTotal)"
            name={t('Dashboard.businesses')}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

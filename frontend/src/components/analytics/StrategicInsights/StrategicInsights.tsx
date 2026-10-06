import React from 'react'
import { Sparkles } from 'lucide-react'
import { TStrategicInsight } from '../../../models/Business'
import { useTranslation } from 'react-i18next'

type Props = {
  insights?: TStrategicInsight[]
  onGenerate?: () => void
  isGenerating?: boolean
}

const TYPE_STYLES: Record<TStrategicInsight['type'], { border: string; bg: string; badge: string; badgeBg: string }> = {
  strength: { border: 'border-green-400', bg: 'bg-green-50', badge: 'text-green-700', badgeBg: 'bg-green-100' },
  improvement: { border: 'border-amber-400', bg: 'bg-amber-50', badge: 'text-amber-700', badgeBg: 'bg-amber-100' },
  opportunity: { border: 'border-blue-400', bg: 'bg-blue-50', badge: 'text-blue-700', badgeBg: 'bg-blue-100' },
}

export function StrategicInsights({ insights = [], onGenerate, isGenerating = false }: Props) {
  const { t } = useTranslation()

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="text-lg text-left font-semibold text-slate-800">
          {t('BusinessDashboard.strategicInsights')}
        </h2>
        {onGenerate && (
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t('BusinessDashboard.generating')}
              </>
            ) : (
              <>
                <Sparkles size={16} />
                {t('BusinessDashboard.generateInsights')}
              </>
            )}
          </button>
        )}
      </div>

      {insights.length === 0 && !isGenerating ? (
        <div className="p-8 text-center text-sm text-slate-400">
          {t('BusinessDashboard.noStrategicInsightsYet')}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 p-4">
          {insights.map((insight, i) => {
            const style = TYPE_STYLES[insight.type]
            return (
              <div
                key={i}
                className={`rounded-xl border-l-4 ${style.border} ${style.bg} p-4`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badgeBg} ${style.badge}`}>
                    {insight.type}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 text-left mb-1">{insight.title}</h3>
                <p className="text-sm text-slate-700 text-left">{insight.description}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

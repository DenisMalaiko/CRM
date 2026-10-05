import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { X, FileText, Film } from 'lucide-react'
import { TIdeaAI } from '../../../../../models/IdeaAI'
import { getStatusClass } from '../../../../../utils/getStatusClass'
import { useUpdateIdeaAIMutation } from '../../../../../store/ai/ideas/ideaAiApi'
import { IdeaStatus } from '../../../../../enum/IdeaStatus'

type Props = {
  idea: TIdeaAI | null
  onClose: () => void
}

type IdeaField = 'who' | 'what' | 'why' | 'how' | 'feeling'

const FIELD_LABEL_KEYS: Record<IdeaField, string> = {
  who: 'BusinessDashboard.ideaWho',
  what: 'BusinessDashboard.ideaWhat',
  why: 'BusinessDashboard.ideaWhy',
  how: 'BusinessDashboard.ideaHow',
  feeling: 'BusinessDashboard.ideaFeeling',
}

const VALUE_PREFIX: Record<IdeaField, string> = {
  who: 'BusinessDashboard.ideaWhoValue_',
  what: 'BusinessDashboard.ideaWhatValue_',
  why: 'BusinessDashboard.ideaWhyValue_',
  how: 'BusinessDashboard.ideaHowValue_',
  feeling: 'BusinessDashboard.ideaFeelingValue_',
}

export function IdeaDetailDlg({ idea, onClose }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { businessId } = useParams<{ businessId: string }>()
  const [updateIdeaAI] = useUpdateIdeaAIMutation()

  async function handleGenerate(type: 'posts' | 'stories') {
    if (!idea || !businessId) return
    await updateIdeaAI({ id: idea.id, form: { status: IdeaStatus.Planned } })
    onClose()
    navigate(`/profile/businesses/${businessId}/${type}`)
  }

  useEffect(() => {
    if (!idea) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [idea, onClose])

  if (!idea) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6 relative max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
        >
          <X size={20} strokeWidth={2} color="white" />
        </button>

        <div className="mt-8 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-slate-800 text-left">{idea.title}</h3>
            <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusClass(idea.status)}`}>
              {idea.status}
            </span>
          </div>

          {idea.description && (
            <p className="text-sm text-slate-600 text-left whitespace-pre-wrap">{idea.description}</p>
          )}

          <div className="grid grid-cols-3 gap-3">
            {(['who', 'what', 'why', 'how', 'feeling'] as const).map((field) =>
              idea[field] ? (
                <div key={field}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5 text-left">
                    {t(FIELD_LABEL_KEYS[field])}
                  </p>
                  <p className="text-sm text-slate-700 text-left">
                    {t(`${VALUE_PREFIX[field]}${idea[field]}`)}
                  </p>
                </div>
              ) : null
            )}
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => handleGenerate('posts')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 cursor-pointer"
            >
              <FileText size={16} />
              {t('BusinessDashboard.generatePost')}
            </button>
            <button
              type="button"
              onClick={() => handleGenerate('stories')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 cursor-pointer"
            >
              <Film size={16} />
              {t('BusinessDashboard.generateStory')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

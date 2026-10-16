import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { X, FileText, Film, Save } from 'lucide-react'
import { toast } from 'react-toastify'
import { TIdeaAI } from '../../../../../models/IdeaAI'
import { getStatusClass } from '../../../../../utils/getStatusClass'
import { useUpdateIdeaAIMutation } from '../../../../../store/ai/ideas/ideaAiApi'
import { IdeaStatus } from '../../../../../enum/IdeaStatus'
import { showError } from '../../../../../utils/showError'

type Props = {
  idea: TIdeaAI | null
  onClose: () => void
  onStatusChange?: (ideaId: string, newStatus: IdeaStatus) => void
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

export function IdeaDetailDlg({ idea, onClose, onStatusChange }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { businessId } = useParams<{ businessId: string }>()
  const [updateIdeaAI, { isLoading: isSaving }] = useUpdateIdeaAIMutation()
  const [status, setStatus] = useState<IdeaStatus>(idea?.status ?? IdeaStatus.New)

  const hasStatusChanged = status !== idea?.status

  async function handleSaveStatus() {
    if (!idea || !hasStatusChanged) return
    try {
      const response = await updateIdeaAI({ id: idea.id, form: { status } }).unwrap()
      if (response?.message) toast.success(response.message)
      onStatusChange?.(idea.id, status)
    } catch (error) {
      showError(error)
    }
  }

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
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl relative max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">{t('BusinessDashboard.ideaDetails')}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="bg-blue-600 rounded-full p-1.5 hover:bg-blue-700 cursor-pointer"
          >
            <X size={18} strokeWidth={2} color="white" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <h3 className="text-base font-semibold text-slate-800 text-left">{idea.title}</h3>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-600">{t('General.status')}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IdeaStatus)}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg cursor-pointer outline-none border border-slate-200 ${getStatusClass(status)}`}
            >
              {Object.values(IdeaStatus).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {hasStatusChanged && (
              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Save size={14} />
                )}
                {t('General.save')}
              </button>
            )}
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

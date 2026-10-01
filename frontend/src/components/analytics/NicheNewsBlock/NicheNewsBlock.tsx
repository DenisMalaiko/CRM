import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { formatDistanceToNow } from "date-fns"
import { TNicheNews } from "../../../models/NicheNews"
import { usePagination } from "../../../hooks/usePagination"
import { TIdeaAI } from "../../../models/IdeaAI"
import { IdeaDetailDlg } from "./components/ideaDetailDlg/IdeaDetailDlg"

type Props = {
  nicheNews: TNicheNews[]
  onFetch?: () => void
  isFetching?: boolean
}

export function NicheNewsBlock({ nicheNews, onFetch, isFetching }: Props) {
  const { t } = useTranslation()

  const [selectedIdea, setSelectedIdea] = useState<TIdeaAI | null>(null)

  const sortedNews = useMemo(
    () =>
      [...nicheNews].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      ),
    [nicheNews]
  )

  const { page, setPage, totalPages, paginatedItems, hasPrev, hasNext } = usePagination({
    items: sortedNews,
    pageSize: 5,
    resetDeps: [nicheNews],
  })

  function handleIdeaClick(e: React.MouseEvent, idea: TIdeaAI) {
    e.stopPropagation()
    setSelectedIdea(idea)
  }

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200 flex flex-col">
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="text-lg text-left font-semibold text-slate-800">{t('BusinessDashboard.nicheNews')}</h2>
        {onFetch && (
          <button
            type="button"
            onClick={onFetch}
            disabled={isFetching}
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            {isFetching ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t('BusinessDashboard.fetching')}
              </>
            ) : (
              t('BusinessDashboard.fetchNews')
            )}
          </button>
        )}
      </div>
      {nicheNews.length === 0 ? (
        <p className="p-4 text-sm text-slate-400">{t('BusinessDashboard.noNicheNewsYet')}</p>
      ) : (
        <div>
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}
              className="flex flex-col px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <p className="text-sm font-medium text-slate-700 text-left">{item.title}</p>
              <p className="text-xs text-slate-400 text-left mt-0.5">
                {item.source} · {item.industry}{item.publishedAt ? ` · ${formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}` : ""}
              </p>
              {item.summary && (
                <p className="text-xs text-slate-500 text-left mt-1 line-clamp-2">{item.summary}</p>
              )}
              {item.ideasAI?.[0] && (
                <button
                  type="button"
                  onClick={(e) => handleIdeaClick(e, item.ideasAI![0])}
                  className="text-xs text-blue-600 text-left mt-1.5 font-medium hover:underline cursor-pointer w-fit"
                >
                  💡 {item.ideasAI![0].title}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="w-full flex items-center border-t p-4 justify-between mt-auto">
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1.5">
            <button
              disabled={!hasPrev}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg shadow disabled:opacity-50 text-white bg-blue-600 hover:bg-blue-700"
            >
              Prev
            </button>
            <button
              disabled={!hasNext}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg shadow disabled:opacity-50 text-white bg-blue-600 hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <IdeaDetailDlg
        idea={selectedIdea}
        onClose={() => setSelectedIdea(null)}
      />
    </div>
  )
}

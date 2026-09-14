import React from "react"
import { formatDistanceToNow } from "date-fns"
import { TNicheNews } from "../../../models/NicheNews"

type Props = {
  nicheNews: TNicheNews[]
}

export function NicheNewsBlock({ nicheNews }: Props) {
  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="text-lg text-left font-semibold text-slate-800">Niche News</h2>
      </div>
      {nicheNews.length === 0 ? (
        <p className="p-4 text-sm text-slate-400">No niche news yet</p>
      ) : (
        <div>
          {nicheNews.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
            >
              <p className="text-sm font-medium text-slate-700 text-left">{item.title}</p>
              <p className="text-xs text-slate-400 text-left mt-0.5">
                {item.source} · {item.industry}{item.publishedAt ? ` · ${formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}` : ""}
              </p>
              <p className="text-xs text-slate-500 text-left mt-1 line-clamp-2">{item.summary}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

import React, { useMemo, useRef, useState, useCallback } from 'react'
import { ExternalLink } from 'lucide-react'
import { TCompetitorWithReport, TTopAd } from '../../../models/Competitor'

type Props = {
  competitors: TCompetitorWithReport[]
}

type TopAdWithCompetitor = TTopAd & { competitorName: string }

function VideoPlayer({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handlePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = false
    video.controls = true
    video.play()
    setIsPlaying(true)
  }, [])

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        playsInline
        onPause={handlePause}
        onEnded={handlePause}
        className="w-full h-full object-cover"
      />
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={handlePlay}
        >
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[12px] border-l-white ml-1" />
          </div>
        </div>
      )}
    </div>
  )
}

export function TopAdsBlock({ competitors }: Props) {
  const topAds = useMemo<TopAdWithCompetitor[]>(() => {
    return competitors
      .flatMap((c) =>
        (c.facebookReport?.topAds ?? []).map((ad) => ({
          ...ad,
          competitorName: c.name,
        }))
      )
      .sort((a, b) => {
        if (a.activeDays == null && b.activeDays == null) return 0
        if (a.activeDays == null) return 1
        if (b.activeDays == null) return -1
        return b.activeDays - a.activeDays
      })
      .slice(0, 10)
  }, [competitors])

  if (topAds.length === 0) return null

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <div className="border-b p-4">
        <h2 className="text-lg text-left font-semibold text-slate-800">Top Ads</h2>
      </div>
      <div className="grid grid-cols-5 gap-4 p-4">
        {topAds.map((ad) => (
          <div
            key={`${ad.competitorName}-${ad.adId}`}
            className="rounded-xl border border-slate-200 overflow-hidden"
          >
            <div className="relative aspect-[3/4] bg-slate-100">
              {ad.video ? (
                <VideoPlayer src={ad.video} poster={ad.image ?? undefined} />
              ) : ad.image ? (
                <img src={ad.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[12px] border-l-white ml-1" />
                  </div>
                </div>
              )}
              {ad.activeDays != null && (
                <span className="absolute top-2 right-2 rounded bg-slate-800/80 px-2 py-0.5 text-xs font-medium text-white">
                  {ad.activeDays} days
                </span>
              )}
            </div>
            <div className="p-3 space-y-1">
              <p className="text-sm font-semibold text-slate-800 truncate text-left">{ad.competitorName}</p>
              <p className="text-xs text-slate-400 truncate text-left">ad_id: {ad.adId}</p>
              <div className="flex items-center justify-between pt-1">
                {ad.url && (
                  <a
                    href={ad.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Open in Meta Ad Library
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                {ad.format && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">{ad.format}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

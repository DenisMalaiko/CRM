import React, { useMemo, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink } from 'lucide-react'
import { TTopPost } from '../../../models/Competitor'

type Props = {
  posts: TTopPost[]
}

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

export function TopPostsBlock({ posts }: Props) {
  const { t } = useTranslation()
  const topPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => {
        if (a.reactions == null && b.reactions == null) return 0
        if (a.reactions == null) return 1
        if (b.reactions == null) return -1
        return b.reactions - a.reactions
      })
      .slice(0, 10)
  }, [posts])

  if (topPosts.length === 0) return null

  return (
    <div className="rounded-2xl bg-white shadow border border-slate-200">
      <div className="border-b p-4">
        <h2 className="text-lg text-left font-semibold text-slate-800">{t('BusinessDashboard.topPosts')}</h2>
      </div>
      <div className="grid grid-cols-5 gap-4 p-4">
        {topPosts.map((post) => (
          <div
            key={post.postId}
            className="rounded-xl border border-slate-200 overflow-hidden"
          >
            <div className="relative aspect-[3/4] bg-slate-100">
              {post.video ? (
                <VideoPlayer src={post.video} poster={post.image ?? undefined} />
              ) : post.image ? (
                <img src={post.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[12px] border-l-white ml-1" />
                  </div>
                </div>
              )}
              {post.reactions != null && (
                <span className="absolute top-2 right-2 rounded bg-slate-800/80 px-2 py-0.5 text-xs font-medium text-white">
                  {post.reactions} {t('BusinessDashboard.reactions')}
                </span>
              )}
            </div>
            <div className="p-3 space-y-1">
              <p className="text-xs text-slate-400 truncate text-left">post_id: {post.postId}</p>
              <div className="flex items-center justify-between pt-1">
                {post.url && (
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    {t('BusinessDashboard.openPost')}
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 pt-1">
                {post.format && (
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">{post.format}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

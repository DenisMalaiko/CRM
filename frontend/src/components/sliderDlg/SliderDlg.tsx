import React from 'react';
import { X, ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Slider from "react-slick";

function PrevArrow({ onClick }: any) {
  return (
    <button
      onClick={onClick}
      aria-label="Previous slide"
      className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-xl z-10 bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
    >
      <ArrowLeftIcon size={20}></ArrowLeftIcon>
    </button>
  )
}

function NextArrow({ onClick }: any) {
  return (
    <button
      onClick={onClick}
      aria-label="Next slide"
      className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-xl z-10 bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
    >
      <ArrowRightIcon size={20}></ArrowRightIcon>
    </button>
  )
}

function SliderDlg({ open, onClose, medias }: { open: boolean, onClose: () => void, medias: any[] }) {
  if (!open) return null;
  if (!medias) return null;

  const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"]
  const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "m4v"]

  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    appendDots: (dots: any) => (
      <div style={{ position: 'absolute', bottom: '-40px', left: 0, right: 0 }} className="flex justify-center w-full px-2">
        <span className="text-white/70 font-bold">
          {dots.findIndex((dot: any) => dot.props.className.includes('slick-active')) + 1}
          {' / '}
          {dots.length}
        </span>
      </div>
    ),
    customPaging: () => <span />,
  }

  const getMediaType = (url: string): "image" | "video" | "unknown" => {
    const cleanUrl = url.split("?")[0]
    const ext = cleanUrl.split(".").pop()?.toLowerCase()

    if (!ext) return "unknown"
    if (IMAGE_EXTENSIONS.includes(ext)) return "image"
    if (VIDEO_EXTENSIONS.includes(ext)) return "video"

    return "unknown"
  }

  const normalizedMedia = medias.filter(x => x.url || x?.thumbnail).map(item => {
    const type = getMediaType(item?.url ?? item?.thumbnail)

    return {
      ...item,
      type,
      isImage: type === "image",
      isVideo: type === "video",
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => onClose()}>
      <button
        onClick={() => onClose()}
        aria-label="Close"
        className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/30 rounded-full p-2 cursor-pointer transition"
      >
        <X size={20} strokeWidth={2} color="white" />
      </button>

      <div className="relative w-[70vw] h-[70vh]" onClick={(e) => e.stopPropagation()}>
        <Slider {...settings}>
          {normalizedMedia?.length > 0 &&
            normalizedMedia.map((media, index) =>
              media.isVideo ? (
                <div key={index} className="h-[70vh]" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <video
                    src={media.url}
                    controls
                    autoPlay
                    className="max-w-full max-h-[70vh]"
                  />
                </div>
              ) : (
                <div key={index} className="h-[70vh]" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                    src={media.url ?? media.thumbnail}
                    alt="image"
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                </div>
              )
            )}
        </Slider>
      </div>
    </div>
  )
}

export default SliderDlg;
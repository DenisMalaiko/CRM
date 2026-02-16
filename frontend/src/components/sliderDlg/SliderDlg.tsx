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
      <div style={{ position: 'relative', bottom: '0px', marginTop: "20px" }} className="flex justify-center w-full px-2 pb-2 text-blue-600">
        <span className="text-blue-600 font-bold">
          {dots.findIndex((dot: any) => dot.props.className.includes('slick-active')) + 1}
          {' / '}
          {dots.length}
        </span>
      </div>
    ),
    customPaging: () => <span />,
  }

  const getMediaType = (url: string): "image" | "video" | "unknown" => {
    console.log("GET MEDIA TYPE: ", url)
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

  console.log("----------")
  console.log("Normalized Media: ", normalizedMedia)
  console.log("----------")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl p-6 relative max-h-[90vh] overflow-auto">

        {/* Close */}
        <button
          onClick={() => onClose()}
          className="absolute top-3 right-3 text-white text-xl z-10 bg-blue-600 rounded-full p-2 hover:bg-blue-700 cursor-pointer"
        >
          <X size={20} strokeWidth={2} color="white"></X>
        </button>

        {/* Slider */}
        <Slider {...settings}>
          {normalizedMedia?.length > 0 &&
            normalizedMedia.map((media, index) =>
              media.isVideo ? (
                <video
                  key={index}
                  src={media.url}
                  controls
                  autoPlay
                  className="h-full w-auto max-h-[80vh]"
                  style={{ width: "auto !important" }}
                />
              ) : (
                <img
                  key={index}
                  src={media.url ?? media.thumbnail}
                  alt="image"
                  className="w-full h-full max-h-[80vh] object-cover"
                />
              )
            )}
        </Slider>
      </div>
    </div>
  )
}

export default SliderDlg;
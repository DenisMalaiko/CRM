import React from 'react';

type Props = {
  overlayHtml: string;
  photoUrl?: string;
};

export function PostOverlay({ overlayHtml, photoUrl }: Props) {
  const bgStyle = photoUrl
    ? `background:url('${photoUrl}') center/cover no-repeat;`
    : 'background:transparent;';

  const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;${bgStyle}}</style></head><body>${overlayHtml}</body></html>`;

  return (
    <iframe
      srcDoc={fullHtml}
      sandbox=""
      title="Post overlay"
      className="absolute inset-0 w-full h-full border-none pointer-events-none"
    />
  );
}

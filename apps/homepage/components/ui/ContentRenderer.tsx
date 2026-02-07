"use client";

import YouTube from "react-youtube";

const YOUTUBE_URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})[\S]*/g;

export function replaceYouTubeUrls(content: string): string {
  return content.replace(YOUTUBE_URL_REGEX, "[youtube]");
}

export function ContentRenderer({ content }: { content: string }) {
  const parts: { type: "text" | "youtube"; value: string }[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(YOUTUBE_URL_REGEX)) {
    const videoId = match[1];
    if (!videoId) continue;

    if (match.index > lastIndex) {
      parts.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: "youtube", value: videoId });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", value: content.slice(lastIndex) });
  }

  if (parts.length === 0) {
    return (
      <p className="text-[15px] leading-[1.6] text-zinc-800 font-normal whitespace-pre-wrap">
        {content}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {parts.map((part, i) =>
        part.type === "text" ? (
          <p
            key={i}
            className="text-[15px] leading-[1.6] text-zinc-800 font-normal whitespace-pre-wrap"
          >
            {part.value}
          </p>
        ) : (
          <div key={i} className="rounded-lg overflow-hidden border border-zinc-100">
            <YouTube
              videoId={part.value}
              opts={{ width: "100%", playerVars: { modestbranding: 1 } }}
              className="w-full [&>iframe]:w-full [&>iframe]:aspect-video [&>iframe]:h-auto"
            />
          </div>
        )
      )}
    </div>
  );
}

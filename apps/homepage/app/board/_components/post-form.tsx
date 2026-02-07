"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import YouTube from "react-youtube";
import { extractYouTubeId } from "@/lib/utils";
import { TAG_OPTIONS, getTagStyle } from "@/lib/tags";

interface PostFormProps {
  headerTitle: string;
  submitLabel: string;
  isPending: boolean;
  isAdmin?: boolean;
  adminQuery?: string;
  onSubmit: (data: {
    title: string;
    content: string;
    display_author: string;
    tags: string[];
  }) => void;
  initialValues?: {
    title: string;
    content: string;
    displayAuthor: string;
    tags?: string[];
  };
}

export default function PostForm({
  headerTitle,
  submitLabel,
  isPending,
  isAdmin,
  adminQuery = "",
  onSubmit,
  initialValues,
}: PostFormProps) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [displayAuthor, setDisplayAuthor] = useState(
    initialValues?.displayAuthor ?? ""
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialValues?.tags ?? []
  );

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title);
      setContent(initialValues.content);
      setDisplayAuthor(initialValues.displayAuthor);
      setSelectedTags(initialValues.tags ?? []);
    }
  }, [initialValues]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const youtubeIds = [
    ...new Set(
      (content
        .match(
          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})[\S]*/g
        )
        ?.map((url) => extractYouTubeId(url))
        .filter(Boolean) as string[]) || []
    ),
  ];

  const insertYoutubeUrl = () => {
    const url = window.prompt("YouTube 영상 URL을 입력하세요");
    if (!url?.trim()) return;

    const textarea = textareaRef.current;
    if (!textarea) {
      setContent((prev) => (prev ? prev + "\n" + url.trim() : url.trim()));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const insert =
      (before && !before.endsWith("\n") ? "\n" : "") +
      url.trim() +
      (after && !after.startsWith("\n") ? "\n" : "");
    const newContent = before + insert + after;
    setContent(newContent);

    requestAnimationFrame(() => {
      const pos = (before + insert).length;
      textarea.selectionStart = textarea.selectionEnd = pos;
      textarea.focus();
    });
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      display_author: displayAuthor.trim() || "익명",
      tags: selectedTags,
    });
  };

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-white">
        <Link href={`/board${adminQuery}`} className="flex items-center text-black">
          <span className="material-symbols-outlined text-[22px]">
            arrow_back_ios
          </span>
        </Link>
        <h1 className="text-[16px] font-medium tracking-tight">
          {headerTitle}
        </h1>
        <div className="w-[22px]" />
      </header>

      {/* Form */}
      <main className="px-6 pt-2 pb-44">
        {/* Input fields */}
        <div className="flex flex-col gap-6">
          {!isAdmin && (
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">
                이름
              </label>
              <input
                value={displayAuthor}
                onChange={(e) => setDisplayAuthor(e.target.value)}
                placeholder="익명"
                className="w-full border border-black/10 rounded-lg px-4 py-3 text-[15px] font-medium placeholder:text-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none"
                maxLength={20}
              />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">
              제목
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-black/10 rounded-lg px-4 py-3 text-[15px] font-medium placeholder:text-gray-300 focus:ring-1 focus:ring-black focus:border-black transition-all outline-none"
              placeholder="제목을 입력하세요"
              type="text"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">
              태그
            </label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => {
                const active = selectedTags.includes(tag);
                const style = getTagStyle(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-[13px] font-medium border transition-all ${
                      active
                        ? `${style.bg} ${style.text} ${style.border}`
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">
              내용
            </label>
            <div className="border border-black/10 rounded-lg focus-within:ring-1 focus-within:ring-black focus-within:border-black transition-all overflow-hidden">
              <div className="flex items-center gap-1 px-3 py-2 border-b border-black/5 bg-gray-50/60">
                <button
                  type="button"
                  onClick={insertYoutubeUrl}
                  className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-white active:scale-95 transition-all"
                  title="YouTube 영상 삽입"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-[18px] h-[18px] fill-current"
                  >
                    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
                  </svg>
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 pb-4 pt-3 text-[15px] leading-relaxed placeholder:text-gray-300 outline-none resize-none min-h-[180px] bg-transparent"
                placeholder="무슨 이야기를 나누고 싶으신가요?"
                maxLength={1000}
              />
            </div>
            <div className="flex justify-end">
              <span className="text-[11px] font-medium text-gray-300 tracking-tighter">
                {content.length} / 1000
              </span>
            </div>
          </div>
        </div>

        {/* YouTube previews */}
        {youtubeIds.length > 0 && (
          <div className="mt-4 flex gap-3 overflow-x-auto">
            {youtubeIds.map((id) => (
              <div
                key={id}
                className="shrink-0 w-48 rounded-lg overflow-hidden border border-black/5"
              >
                <YouTube
                  videoId={id}
                  opts={{
                    width: "192",
                    height: "108",
                    playerVars: { modestbranding: 1 },
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating submit button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-white via-white to-white/0">
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || isPending}
          className="w-full bg-black text-white py-4 rounded-2xl text-[15px] font-semibold tracking-wide active:opacity-70 transition-opacity disabled:opacity-30"
        >
          {isPending ? "..." : submitLabel}
        </button>
      </div>
    </div>
  );
}

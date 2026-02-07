"use client";

interface LikeButtonProps {
  liked: boolean;
  count: number;
  disabled?: boolean;
  onToggle: () => void;
}

export function LikeButton({ liked, count, disabled, onToggle }: LikeButtonProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`flex items-center gap-1.5 transition-colors ${
        disabled
          ? "text-zinc-300 cursor-not-allowed"
          : liked
          ? "text-red-500"
          : "text-zinc-400 active:text-red-400"
      }`}
    >
      <span
        className={`material-symbols-outlined text-[20px] ${
          liked ? "fill-1 text-red-500" : ""
        }`}
      >
        favorite
      </span>
      <span className="text-[13px] font-medium">{count}</span>
    </button>
  );
}

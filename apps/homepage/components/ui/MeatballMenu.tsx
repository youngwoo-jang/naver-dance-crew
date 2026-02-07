"use client";

import { useState, useRef, useEffect } from "react";

interface MeatballMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function MeatballMenu({ onEdit, onDelete }: MeatballMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="flex items-center justify-center size-8 rounded-full hover:bg-zinc-100 transition-colors"
      >
        <span className="material-symbols-outlined text-[20px] text-zinc-500">
          more_vert
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-zinc-100 overflow-hidden z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onEdit();
            }}
            className="w-full px-4 py-2.5 text-left text-[14px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            수정
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
            className="w-full px-4 py-2.5 text-left text-[14px] font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
}

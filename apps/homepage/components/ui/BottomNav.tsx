"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "home", label: "홈(준비중)" },
  { href: "/board", icon: "forum", label: "익명게시판" },
] as const;

export function BottomNav({ adminQuery = "" }: { adminQuery?: string }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 ios-bottom-nav px-8 pt-4 pb-8 flex items-center z-50">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={`${item.href}${adminQuery}`}
            className={`flex-1 flex flex-col items-center gap-1 ${
              isActive ? "text-black" : "text-gray-400"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[28px] ${
                isActive ? "active-icon" : ""
              }`}
            >
              {item.icon}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-tighter">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

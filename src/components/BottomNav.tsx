"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiHome, HiCollection, HiClipboardList, HiBadgeCheck, HiCog } from "react-icons/hi";

const navItems = [
  { href: "/",         label: "ホーム",    Icon: HiHome },
  { href: "/repoca",   label: "RepoCa/PJ", Icon: HiCollection },
  { href: "/report",   label: "報告",      Icon: HiClipboardList },
  { href: "/mypage",   label: "バッジ",    Icon: HiBadgeCheck },
  { href: "/settings", label: "設定",      Icon: HiCog },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive ? "active" : ""}`}
          >
            <item.Icon style={{ fontSize: 20, width: 20, height: 20 }} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

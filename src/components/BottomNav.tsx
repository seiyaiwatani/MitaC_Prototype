"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomNav.module.scss";

const navItems = [
  { href: "/",       label: "ホーム",    icon: "🏠" },
  { href: "/repoca", label: "RepoCa",   icon: "🃏" },
  { href: "/report", label: "報告",      icon: "📋" },
  { href: "/mypage", label: "マイページ", icon: "⚔️" },
  { href: "/admin",  label: "管理",      icon: "🔧" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottom_nav}>
      <div className={styles.bottom_nav_inner}>
        {navItems.map((item) => {
          const isActive = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.bottom_nav_item} ${isActive ? styles["bottom_nav_item--active"] : ""}`}
            >
              <span className={styles.bottom_nav_icon}>{item.icon}</span>
              <span className={styles.bottom_nav_label}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

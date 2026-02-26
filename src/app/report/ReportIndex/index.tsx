import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import styles from "./index.module.scss";

const REPORTS = [
  {
    href: "/report/start",
    icon: "🌅",
    title: "始業報告",
    desc: "今日のRepoCaを設定して始業を報告",
    color: "#4f46e5",
    done: true,
  },
  {
    href: "/report/end",
    icon: "🌇",
    title: "終業報告",
    desc: "各RepoCaの工数と完了状況を報告",
    color: "#f59e0b",
    done: false,
  },
  {
    href: "/report/overtime",
    icon: "🌙",
    title: "残業報告",
    desc: "残業の有無と内容を報告",
    color: "#312e81",
    done: false,
  },
];

export default function ReportIndex() {
  return (
    <div className="page-root">
      <PageHeader background="linear-gradient(90deg,#4f46e5,#7c3aed)" />

      <div className={`page-body scroll-y ${styles.report_index_body}`}>
        {REPORTS.map((item) => (
          <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
            <div className={`card ${styles.report_index_card}`}>
              <div
                className={styles.report_index_card_icon}
                style={{ background: `${item.color}20` }}
              >
                {item.icon}
              </div>
              <div className={styles.report_index_card_info}>
                <div className={styles.report_index_card_title_row}>
                  <span className={styles.report_index_card_title}>{item.title}</span>
                  {item.done && (
                    <span className={styles.report_index_card_done}>提出済み</span>
                  )}
                </div>
                <p className={styles.report_index_card_desc}>{item.desc}</p>
              </div>
              <span className={styles.report_index_card_arrow}>›</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

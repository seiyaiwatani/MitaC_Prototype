import Link from "next/link";

export default function ReportIndex() {
  return (
    <div className="min-h-screen">
      <div
        style={{
          background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
          padding: "20px 16px 60px",
        }}
      >
        <h1 className="text-white text-xl font-bold">📋 報告</h1>
        <p className="text-indigo-200 text-sm mt-1">今日の報告を選択してください</p>
      </div>

      <div className="px-4 -mt-10 space-y-3">
        {[
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
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="card p-4 flex items-center gap-4 mt-0 mb-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: `${item.color}20` }}
              >
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-gray-800">{item.title}</h2>
                  {item.done && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                      提出済み
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
              </div>
              <span className="text-gray-400 text-xl">›</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

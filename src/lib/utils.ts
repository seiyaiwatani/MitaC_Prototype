/** 分数を「~時間~分」形式に変換（例: 0→"0分", 45→"45分", 60→"1時間", 90→"1時間30分"） */
export function fmtDuration(min: number): string {
  if (min === 0) return "0分";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}時間`;
  return `${h}時間${m}分`;
}

/** 15分刻みで 0〜12時間（0〜720分）の選択肢を生成 */
export const DURATION_OPTIONS: { label: string; value: number }[] = Array.from(
  { length: 49 },
  (_, i) => {
    const value = i * 15;
    return { label: fmtDuration(value), value };
  }
);

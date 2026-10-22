// datetime-local values use the browser's local timezone, never UTC slicing.
export function localDateTimeMin(now = new Date()): string {
 const next = new Date(Math.ceil(now.getTime() / 60000) * 60000);
 const pad = (n: number) => String(n).padStart(2, '0');
 return `${next.getFullYear()}-${pad(next.getMonth()+1)}-${pad(next.getDate())}T${pad(next.getHours())}:${pad(next.getMinutes())}`;
}
export function validateDeadline(value?: string | null, now = Date.now()): string | null {
 if (!value) return null;
 const timestamp = new Date(value).getTime();
 if (!Number.isFinite(timestamp)) throw Error('请选择有效的期望完成时间');
 if (timestamp < now) throw Error('期望完成时间不能早于当前时间，请重新选择');
 return new Date(timestamp).toISOString();
}

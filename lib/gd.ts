export function getDevGdId() {
  const raw = process.env.DEV_GD_ID ?? "1";
  const n = Number(raw);
  return Number.isFinite(n) ? n : 1;
}

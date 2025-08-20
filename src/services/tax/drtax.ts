// ---- cache local 24h
function cacheGet<T>(key: string): T | null
{
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts < 24 * 60 * 60 * 1000) return data as T;
    return null;
  } catch { return null; }
}
function cacheSet<T>(key: string, data: T)
{
  localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
}

// ---- types & normalisation
export type Option = { id: number | string; label: string };
function normalizeOptions(items: any[]): Option[]
{
  return (items || []).map((it) =>
  {
    const id = it.id ?? it.value ?? it.code ?? it.key ?? it.Id ?? it.Value ?? it.Code ?? it.Key;
    const label = it.name ?? it.text ?? it.label ?? it.Name ?? it.Text ?? it.Label;
    return { id, label };
  });
}

// ---- picklists
export async function drtaxPicklist(path: string, payload?: any)
{
  const cacheKey = `drtax:${path}:${JSON.stringify(payload || {})}`;
  const cached = cacheGet<any>(cacheKey);
  if (cached) return cached;

  const res = await fetch(`/.netlify/functions/drtax-picklist?path=${encodeURIComponent(path)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload })
  });
  if (!res.ok) throw new Error(`Picklist error ${res.status}`);
  const data = await res.json();
  cacheSet(cacheKey, data);
  return data;
}

export async function getCantons(): Promise<Option[]>
{
  const data = await drtaxPicklist("/CantonList");
  return normalizeOptions(data);
}

export async function getTaxCommunities(cantonId: number | string): Promise<Option[]>
{
  const data = await drtaxPicklist("/TaxCommunityList", { canton: cantonId, language: "fr" });
  return normalizeOptions(data);
}

// ---- calcul NP
export async function drtaxCalculateNP(payload: any)
{
  const res = await fetch("/.netlify/functions/drtax-np", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`DrTax error ${res.status}`);
  return res.json();
}

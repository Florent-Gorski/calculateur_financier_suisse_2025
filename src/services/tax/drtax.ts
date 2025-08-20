// calcule NP (personnes physiques)
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

// picklist avec cache local 24h
export async function drtaxPicklist(path: string)
{
  const key = `drtax:${path}`;
  const raw = localStorage.getItem(key);
  if (raw) {
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts < 24 * 60 * 60 * 1000) return data;
  }
  const res = await fetch(`/.netlify/functions/drtax-picklist?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`Picklist error ${res.status}`);
  const json = await res.json();
  localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data: json }));
  return json;
}

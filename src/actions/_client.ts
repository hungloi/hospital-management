export async function post(path: string, body: any) {
  try {
    const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: 'Network error' };
  }
}

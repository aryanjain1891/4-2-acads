export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data?.error || `Request failed (${res.status})` };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Network error. Is the server running?" };
  }
}

export async function apiPost<T = unknown>(url: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  return apiFetch<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function apiPut<T = unknown>(url: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  return apiFetch<T>(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function apiDelete(url: string): Promise<{ ok: true; data: unknown } | { ok: false; error: string }> {
  return apiFetch(url, { method: "DELETE" });
}

export async function apiPostForm<T = unknown>(url: string, formData: FormData): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  return apiFetch<T>(url, { method: "POST", body: formData });
}

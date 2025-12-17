const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

async function apiFetch(path, { method = "GET", token, body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = isJson && data?.error ? data.error : res.statusText;
    throw new Error(message || "Request failed");
  }

  return data;
}

export const statusApi = {
  check: () => apiFetch("/status"),
};

export const authApi = {
  register: (payload) => apiFetch("/auth/register", { method: "POST", body: payload }),
  login: (payload) => apiFetch("/auth/login", { method: "POST", body: payload }),
};

export const bookApi = {
  list: ({ search = "", category = "", page = 1, limit = 10 } = {}) => {
    const params = new URLSearchParams({ search, category, page, limit });
    return apiFetch(`/books?${params.toString()}`);
  },
  get: (id) => apiFetch(`/books/${id}`),
  create: (token, payload) => apiFetch("/books", { method: "POST", token, body: payload }),
  update: (token, id, payload) => apiFetch(`/books/${id}`, { method: "PUT", token, body: payload }),
  remove: (token, id) => apiFetch(`/books/${id}`, { method: "DELETE", token }),
};

export const borrowApi = {
  borrow: (token, bookId) => apiFetch(`/borrow/${bookId}`, { method: "POST", token }),
  returnBook: (token, borrowingId) => apiFetch(`/return/${borrowingId}`, { method: "POST", token }),
  listBorrowings: (token, { active = false, member_id, page = 1, limit = 10 } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (active) params.set("active", "true");
    if (member_id) params.set("member_id", member_id);
    return apiFetch(`/borrowings?${params.toString()}`, { token });
  },
  history: (token, { member_id, page = 1, limit = 10 } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (member_id) params.set("member_id", member_id);
    return apiFetch(`/history?${params.toString()}`, { token });
  },
};
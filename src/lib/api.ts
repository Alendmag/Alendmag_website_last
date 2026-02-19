const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function request<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.error || `Request failed: ${res.status}`);
  }
  return json.data as T;
}

function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const p = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return p ? `?${p}` : '';
}

export const auth = {
  login: (username: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  check: () => request('/auth/check'),
};

export const products = {
  list: (params?: { limit?: number; active?: boolean }) =>
    request<any[]>(`/products${qs({ ...params })}`),
  count: () => request<{ count: number }>('/products/count'),
  get: (id: string) => request<any>(`/products/${id}`),
  create: (data: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request(`/products/${id}`, { method: 'DELETE' }),
};

export const orders = {
  list: (params?: { limit?: number; offset?: number; status?: string }) =>
    request<{ data: any[]; total: number }>(`/orders${qs({ ...params })}`),
  count: () => request<{ count: number }>('/orders/count'),
  get: (id: string) => request<any>(`/orders/${id}`),
  create: (data: any) => request<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request(`/orders/${id}`, { method: 'DELETE' }),
};

export const clients = {
  list: () => request<any[]>('/clients'),
  count: () => request<{ count: number }>('/clients/count'),
  get: (id: string) => request<any>(`/clients/${id}`),
  create: (data: any) => request<any>('/clients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request(`/clients/${id}`, { method: 'DELETE' }),
};

export const projects = {
  list: (params?: { status?: string; client_id?: string }) =>
    request<any[]>(`/projects${qs({ ...params })}`),
  count: () => request<{ count: number }>('/projects/count'),
  get: (id: string) => request<any>(`/projects/${id}`),
  create: (data: any) => request<any>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request(`/projects/${id}`, { method: 'DELETE' }),
};

export const projectTasks = {
  list: (projectId: string) => request<any[]>(`/project_tasks?project_id=${projectId}`),
  get: (id: string) => request<any>(`/project_tasks/${id}`),
  create: (data: any) => request<any>('/project_tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/project_tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request(`/project_tasks/${id}`, { method: 'DELETE' }),
};

export const teamMembers = {
  list: () => request<any[]>('/team_members'),
  count: () => request<{ count: number }>('/team_members/count'),
  get: (id: string) => request<any>(`/team_members/${id}`),
  create: (data: any) => request<any>('/team_members', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/team_members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request(`/team_members/${id}`, { method: 'DELETE' }),
};

export const blogPosts = {
  list: (params?: { limit?: number; offset?: number; category?: string; published?: boolean }) =>
    request<{ data: any[]; total: number }>(`/blog_posts${qs({ ...params })}`),
  count: () => request<{ count: number }>('/blog_posts/count'),
  get: (id: string) => request<any>(`/blog_posts/${id}`),
  getBySlug: (slug: string) => request<any>(`/blog_posts/by-slug/${encodeURIComponent(slug)}`),
  create: (data: any) => request<any>('/blog_posts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/blog_posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request(`/blog_posts/${id}`, { method: 'DELETE' }),
  incrementViews: (id: string) => request(`/blog_posts/${id}/views`, { method: 'POST' }),
};

export const testimonials = {
  list: () => request<any[]>('/testimonials'),
  count: () => request<{ count: number }>('/testimonials/count'),
  get: (id: string) => request<any>(`/testimonials/${id}`),
  create: (data: any) => request<any>('/testimonials', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request(`/testimonials/${id}`, { method: 'DELETE' }),
};

export const faq = {
  list: () => request<any[]>('/faq'),
  count: () => request<{ count: number }>('/faq/count'),
  get: (id: string) => request<any>(`/faq/${id}`),
  create: (data: any) => request<any>('/faq', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/faq/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request(`/faq/${id}`, { method: 'DELETE' }),
};

export const contactMessages = {
  list: (params?: { archived?: boolean; limit?: number; offset?: number }) =>
    request<{ data: any[]; total: number }>(`/contact_messages${qs({ archived: params?.archived ? 1 : 0, limit: params?.limit, offset: params?.offset })}`),
  count: () => request<{ count: number }>('/contact_messages/count'),
  get: (id: string) => request<any>(`/contact_messages/${id}`),
  create: (data: any) => request<any>('/contact_messages', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/contact_messages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request(`/contact_messages/${id}`, { method: 'DELETE' }),
};

export const supportTickets = {
  list: (params?: { status?: string; limit?: number; offset?: number }) =>
    request<{ data: any[]; total: number }>(`/support_tickets${qs({ ...params })}`),
  count: () => request<{ count: number }>('/support_tickets/count'),
  get: (id: string) => request<any>(`/support_tickets/${id}`),
  create: (data: any) => request<any>('/support_tickets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/support_tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request(`/support_tickets/${id}`, { method: 'DELETE' }),
};

export const ticketReplies = {
  list: (ticketId: string) => request<any[]>(`/ticket_replies?ticket_id=${ticketId}`),
  create: (data: any) => request<any>('/ticket_replies', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: string) => request(`/ticket_replies/${id}`, { method: 'DELETE' }),
};

export const supportVideos = {
  list: () => request<any[]>('/support_videos'),
  get: (id: string) => request<any>(`/support_videos/${id}`),
  create: (data: any) => request<any>('/support_videos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request<any>(`/support_videos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request(`/support_videos/${id}`, { method: 'DELETE' }),
};

export const siteSettings = {
  list: (category?: string) =>
    request<any[]>(`/site_settings${category ? `?category=${category}` : ''}`),
  get: (category: string, key: string) =>
    request<any>(`/site_settings?category=${category}&key=${key}`),
  update: (id: string, value: string) =>
    request<any>(`/site_settings/${id}`, { method: 'PUT', body: JSON.stringify({ setting_value: value }) }),
  bulkUpdate: (items: Array<{ category: string; setting_key: string; setting_value: string }>) =>
    request('/site_settings', { method: 'PUT', body: JSON.stringify(items) }),
  create: (data: any) => request<any>('/site_settings', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: string) => request(`/site_settings/${id}`, { method: 'DELETE' }),
};

export const dashboardStats = {
  get: () => request<any>('/dashboard_stats'),
};

export async function uploadFile(file: File, folder: string = 'misc'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/upload?folder=${folder}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || 'Upload failed');
  return json.data.url as string;
}

export async function deleteFile(url: string): Promise<void> {
  await fetch(`${BASE_URL}/upload?url=${encodeURIComponent(url)}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

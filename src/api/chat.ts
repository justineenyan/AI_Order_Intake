import type { FrontendChatRequest, FrontendChatResponse } from '../types/chat'
import { mockReply } from './mock'

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export async function sendChat(
  req: FrontendChatRequest,
  signal?: AbortSignal,
): Promise<FrontendChatResponse> {
  if (USE_MOCK) return mockReply(req, signal)

  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
    signal,
  })

  // The backend sends { success: false, error } on handled failures, so try to
  // read the body even on non-2xx before falling back to the status code.
  let body: FrontendChatResponse | null = null
  try {
    body = await res.json()
  } catch {
    // not JSON (proxy error page, 413 from express, etc.)
  }

  if (!res.ok || !body) {
    if (res.status === 413) throw new Error('The attachment is too large for the server.')
    throw new Error(body?.error || `Request failed (${res.status})`)
  }
  if (!body.success && body.error && !body.chat) {
    throw new Error(body.error)
  }
  return body
}

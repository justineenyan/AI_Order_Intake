// Mirrors the backend contract. Keep in sync with the server types.

// TODO: replace with the real union from the backend once confirmed.
// The (string & {}) keeps autocomplete for known values but accepts new ones.
export type RouteType =
  | 'CHAT'
  | 'ORDER'
  | 'GRAPHQL'
  | 'ANALYTICS'
  | 'UNKNOWN'
  | (string & {})

/**
 * User & Organization Context loaded from frontend Redux (state.auth.user)
 */
export interface UserContext {
  userId?: string
  customerId?: number | string
  companyId?: string
  countryId?: number
  locationId?: string
  canCreateOrder?: boolean
}

/**
 * Stateful conversation memory echoed back and forth by the frontend (stateless server)
 */
export interface ChatSessionContext {
  lastRoute?: RouteType | null
  lastUserPrompt?: string | null
  conversationId?: string
  orderState?: Record<string, unknown>
}

/**
 * UI Rendering hint telling the frontend what custom card/component to show
 */
export type UiHint =
  | 'TEXT'
  | 'PRODUCT_SELECTOR'
  | 'ORDER_SUMMARY'
  | 'RECEIPT_UPLOAD'
  | 'DATA_TABLE'
  | 'CONFIRMATION'

/**
 * File sent along with a message, e.g. a payment receipt screenshot or PDF.
 * Not part of the original contract - added for receipt extraction.
 */
export interface ChatAttachment {
  name: string
  mimeType: string
  size: number
  data: string // base64, without the "data:...;base64," prefix
}

/**
 * Request body sent by frontend chat widget (POST /api/chat)
 */
export interface FrontendChatRequest {
  message: string
  userContext?: UserContext
  sessionContext?: ChatSessionContext
  accessToken?: string
  attachments?: ChatAttachment[]
}

/**
 * Response body received by frontend chat widget
 */
export interface FrontendChatResponse<TData = unknown> {
  success: boolean
  responseType: RouteType
  chat: string
  data?: TData | null
  uiHint?: UiHint
  suggestions?: string[]
  sessionContext?: ChatSessionContext
  debug?: {
    route: RouteType
    confidence: number
    latencyMs: number
    reason?: string
  }
  error?: string | null
}

// What we keep in local state for each bubble. Attachments carry an object URL
// for previews instead of the base64 payload.
export interface AttachmentPreview {
  id: string
  name: string
  mimeType: string
  size: number
  url: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  text: string
  attachments?: AttachmentPreview[]
  response?: FrontendChatResponse
  status: 'sending' | 'done' | 'error'
  error?: string
  createdAt: number
}

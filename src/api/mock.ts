// Fake backend for working on the UI without the Express server running.
// Very rough keyword matching - just enough to hit every uiHint.

import type { FrontendChatRequest, FrontendChatResponse, RouteType, UiHint } from '../types/chat'

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })

const PRODUCTS = [
  { id: 'cem-425', name: 'Supaset 42.5R', description: 'High early strength, for columns and slabs', unit: '50kg bag', price: 1250 },
  { id: 'cem-325', name: 'Multicem 32.5N', description: 'General purpose, blocks and plastering', unit: '50kg bag', price: 1050 },
  { id: 'cem-mason', name: 'Masonry Cement', description: 'Smooth mortar for brick and block laying', unit: '50kg bag', price: 980 },
]

export async function mockReply(
  req: FrontendChatRequest,
  signal?: AbortSignal,
): Promise<FrontendChatResponse> {
  const started = performance.now()
  await wait(700 + Math.random() * 700, signal)

  const text = req.message.toLowerCase()
  const order = { ...(req.sessionContext?.orderState ?? {}) }
  const conversationId = req.sessionContext?.conversationId ?? `conv_${Date.now().toString(36)}`

  let route: RouteType = 'CHAT'
  let uiHint: UiHint = 'TEXT'
  let chat: string
  let data: unknown = null
  let suggestions: string[] = []
  let reason: string

  if (req.attachments?.length) {
    route = 'ORDER'
    uiHint = 'CONFIRMATION'
    chat = "Thanks, I've read your receipt and matched it to your order. Payment is confirmed."
    data = {
      title: 'Payment received',
      orderId: (order.orderId as string) ?? 'HM20240521001',
      amount: 125000,
      currency: 'KES',
      reference: 'QFT7Y2K9LM',
      paidAt: new Date().toISOString(),
    }
    suggestions = ['Track my delivery', 'Show my recent orders']
    reason = `receipt attached (${req.attachments.map((a) => a.mimeType).join(', ')})`
  } else if (/confirm|place (the )?order|yes/.test(text) && order.product) {
    route = 'ORDER'
    uiHint = 'RECEIPT_UPLOAD'
    order.orderId = 'HM20240521001'
    chat = `Order ${order.orderId} is placed. Once you've paid, upload the receipt (a screenshot or PDF is fine) and I'll confirm it.`
    data = { orderId: order.orderId, amount: order.total, currency: 'KES' }
    suggestions = ['I paid by M-Pesa', 'Pay later']
    reason = 'order confirmation with product in session'
  } else if (/receipt|paid|payment|upload/.test(text)) {
    route = 'ORDER'
    uiHint = 'RECEIPT_UPLOAD'
    chat = 'Sure. Attach your payment receipt below and I will pull out the amount and reference.'
    data = { orderId: order.orderId ?? null }
    reason = 'payment keywords'
  } else if (/track|status|recent|history|my orders/.test(text)) {
    route = 'GRAPHQL'
    uiHint = 'DATA_TABLE'
    chat = 'Here are your last few orders.'
    data = [
      { orderId: 'HM20240521001', product: 'Supaset 42.5R', bags: 100, status: 'In transit', eta: 'Today, 4pm' },
      { orderId: 'HM20240514007', product: 'Multicem 32.5N', bags: 250, status: 'Delivered', eta: '14 May' },
      { orderId: 'HM20240502003', product: 'Masonry Cement', bags: 60, status: 'Delivered', eta: '02 May' },
    ]
    suggestions = ['Where is HM20240521001?', 'Order again']
    reason = 'order history lookup'
  } else if (/plant|tema|takoradi|deliver|site/.test(text) && order.product) {
    route = 'ORDER'
    uiHint = 'ORDER_SUMMARY'
    order.location = req.message
    const qty = Number(order.quantity ?? 100)
    const price = Number(order.unitPrice ?? 1250)
    order.total = qty * price
    chat = "Here's your order. Check the details and confirm when you're ready."
    data = {
      product: order.product,
      quantity: qty,
      unit: '50kg bags',
      location: order.location,
      unitPrice: price,
      total: order.total,
      currency: 'KES',
    }
    suggestions = ['Confirm order', 'Change quantity']
    reason = 'all order fields collected'
  } else if (/order|buy|bags?|cement|supaset|multicem|masonry|i'd like/.test(text)) {
    route = 'ORDER'
    const qty = text.match(/(\d+)\s*bags?/)?.[1]
    if (qty) order.quantity = Number(qty)

    const picked = PRODUCTS.find((p) => text.includes(p.name.toLowerCase().split(' ')[0]))
    if (picked) {
      order.product = picked.name
      order.unitPrice = picked.price
      chat = `${picked.name}, got it${order.quantity ? ` - ${order.quantity} bags` : ''}. Where should we deliver?`
      suggestions = ['Construction Site A', 'Pick up at Tema Plant', 'Pick up at Takoradi Plant']
      reason = 'product selected, need location'
    } else {
      uiHint = 'PRODUCT_SELECTOR'
      chat = 'Which cement do you need?'
      data = PRODUCTS
      reason = 'order intent, product missing'
    }
  } else if (/fail|error/.test(text)) {
    throw new Error('Mock backend error (you typed "error").')
  } else {
    chat =
      "I can help you order cement, upload a payment receipt, or check on a delivery. What would you like to do?"
    suggestions = ['Order 100 bags of cement', 'Track my order', 'Upload payment receipt']
    reason = 'no intent matched, fallback'
  }

  return {
    success: true,
    responseType: route,
    chat,
    data,
    uiHint,
    suggestions,
    sessionContext: {
      conversationId,
      lastRoute: route,
      lastUserPrompt: req.message,
      orderState: order,
    },
    debug: {
      route,
      confidence: Math.round((0.72 + Math.random() * 0.26) * 100) / 100,
      latencyMs: Math.round(performance.now() - started),
      reason: `mock: ${reason}`,
    },
    error: null,
  }
}

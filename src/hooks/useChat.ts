import { useCallback, useEffect, useRef, useState } from 'react'
import { sendChat } from '../api/chat'
import { fileToBase64 } from '../lib/files'
import type {
  AttachmentPreview,
  ChatMessage,
  ChatSessionContext,
  FrontendChatRequest,
} from '../types/chat'

const uid = () => Math.random().toString(36).slice(2, 10)

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [busy, setBusy] = useState(false)

  // The server is stateless - whatever it hands back here goes out on the next turn.
  const sessionRef = useRef<ChatSessionContext | undefined>(undefined)
  // Keep the exact request per bot message so "Retry" resends the same thing.
  const requests = useRef(new Map<string, FrontendChatRequest>())
  const controller = useRef<AbortController | null>(null)
  const objectUrls = useRef<string[]>([])

  const updateMessage = (id: string, patch: Partial<ChatMessage>) =>
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, ...patch } : m)))

  const run = useCallback(async (botId: string, req: FrontendChatRequest) => {
    controller.current?.abort()
    const ctrl = new AbortController()
    controller.current = ctrl
    setBusy(true)

    try {
      const response = await sendChat(
        { ...req, sessionContext: sessionRef.current ?? req.sessionContext },
        ctrl.signal,
      )
      if (response.sessionContext) sessionRef.current = response.sessionContext
      updateMessage(botId, {
        status: 'done',
        text: response.chat,
        response,
        error: undefined,
      })
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      updateMessage(botId, {
        status: 'error',
        error: (err as Error).message || 'Something went wrong',
      })
    } finally {
      if (controller.current === ctrl) {
        controller.current = null
        setBusy(false)
      }
    }
  }, [])

  const send = useCallback(
    async (text: string, files: File[] = []) => {
      const message = text.trim()
      if ((!message && files.length === 0) || busy) return

      const previews: AttachmentPreview[] = files.map((f) => {
        const url = URL.createObjectURL(f)
        objectUrls.current.push(url)
        return { id: uid(), name: f.name, mimeType: f.type, size: f.size, url }
      })

      const userMsg: ChatMessage = {
        id: uid(),
        role: 'user',
        text: message,
        attachments: previews,
        status: 'done',
        createdAt: Date.now(),
      }
      const botMsg: ChatMessage = {
        id: uid(),
        role: 'bot',
        text: '',
        status: 'sending',
        createdAt: Date.now(),
      }
      setMessages((list) => [...list, userMsg, botMsg])

      let attachments: FrontendChatRequest['attachments']
      try {
        if (files.length) {
          attachments = await Promise.all(
            files.map(async (f) => ({
              name: f.name,
              mimeType: f.type,
              size: f.size,
              data: await fileToBase64(f),
            })),
          )
        }
      } catch {
        updateMessage(botMsg.id, { status: 'error', error: 'Could not read the attached file.' })
        return
      }

      const req: FrontendChatRequest = {
        // Some routers choke on an empty message, so give it something to go on.
        message: message || 'I have attached my payment receipt.',
        attachments,
      }
      requests.current.set(botMsg.id, req)
      await run(botMsg.id, req)
    },
    [busy, run],
  )

  const retry = useCallback(
    (botId: string) => {
      const req = requests.current.get(botId)
      if (!req || busy) return
      updateMessage(botId, { status: 'sending', error: undefined })
      run(botId, req)
    },
    [busy, run],
  )

  const reset = useCallback(() => {
    controller.current?.abort()
    controller.current = null
    objectUrls.current.forEach((u) => URL.revokeObjectURL(u))
    objectUrls.current = []
    requests.current.clear()
    sessionRef.current = undefined
    setBusy(false)
    setMessages([])
  }, [])

  // free the blob urls when the app unmounts
  useEffect(() => {
    const urls = objectUrls
    return () => urls.current.forEach((u) => URL.revokeObjectURL(u))
  }, [])

  return { messages, busy, send, retry, reset }
}

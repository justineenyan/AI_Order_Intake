import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChatActionsContext } from './chatActions'
import Composer from './components/Composer'
import Header from './components/Header'
import { UploadIcon } from './components/icons'
import MessageList from './components/MessageList'
import Welcome from './components/Welcome'
import { useChat } from './hooks/useChat'
import { useTheme } from './hooks/useTheme'
import { MAX_FILES, validateFile } from './lib/files'
import './App.css'

export default function App() {
  const { theme, toggle } = useTheme()
  const { messages, busy, send, retry, reset } = useChat()

  const [files, setFiles] = useState<File[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [debug, setDebug] = useState(() => localStorage.getItem('debug') === '1')
  const dragDepth = useRef(0)

  useEffect(() => {
    localStorage.setItem('debug', debug ? '1' : '0')
  }, [debug])

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(t)
  }, [notice])

  const addFiles = useCallback((incoming: File[]) => {
    const problems: string[] = []
    const ok = incoming.filter((f) => {
      const err = validateFile(f)
      if (err) problems.push(err)
      return !err
    })

    const room = Math.max(MAX_FILES - files.length, 0)
    if (ok.length > room) problems.push(`You can attach up to ${MAX_FILES} files`)
    if (room > 0 && ok.length) setFiles([...files, ...ok.slice(0, room)])
    if (problems.length) setNotice(problems[0])
  }, [files])

  const handleSend = useCallback(
    (text: string) => {
      send(text, files)
      setFiles([])
    },
    [send, files],
  )

  const actions = useMemo(
    () => ({ send: (t: string) => send(t), addFiles, busy }),
    [send, addFiles, busy],
  )

  const newChat = () => {
    reset()
    setFiles([])
  }

  const hasMessages = messages.length > 0

  return (
    <ChatActionsContext.Provider value={actions}>
      <div
        className="app"
        onDragEnter={(e) => {
          if (!e.dataTransfer.types.includes('Files')) return
          dragDepth.current += 1
          setDragging(true)
        }}
        onDragLeave={() => {
          dragDepth.current -= 1
          if (dragDepth.current <= 0) {
            dragDepth.current = 0
            setDragging(false)
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          dragDepth.current = 0
          setDragging(false)
          if (e.dataTransfer.files.length) addFiles(Array.from(e.dataTransfer.files))
        }}
      >
        <Header
          theme={theme}
          onToggleTheme={toggle}
          debug={debug}
          onToggleDebug={() => setDebug((d) => !d)}
          onNewChat={newChat}
          hasMessages={hasMessages}
        />

        <main className="main">
          <div className="container">
            {hasMessages ? (
              <MessageList messages={messages} showDebug={debug} onRetry={retry} />
            ) : (
              <Welcome onPick={(t) => send(t)} />
            )}
          </div>
        </main>

        <div className="container">
          <Composer
            files={files}
            onAddFiles={addFiles}
            onRemoveFile={(i) => setFiles((list) => list.filter((_, idx) => idx !== i))}
            onSend={handleSend}
            busy={busy}
            notice={notice}
          />
        </div>

        {dragging && (
          <div className="drop-overlay">
            <div className="drop-overlay__box">
              <UploadIcon size={34} />
              <strong>Drop your receipt here</strong>
              <span>PNG, JPG, WEBP or PDF</span>
            </div>
          </div>
        )}
      </div>
    </ChatActionsContext.Provider>
  )
}

import type { FrontendChatResponse } from '../types/chat'

export default function DebugPanel({ response }: { response: FrontendChatResponse }) {
  const d = response.debug

  return (
    <details className="debug">
      <summary>
        <span className="debug__pill">{d?.route ?? response.responseType}</span>
        {d && (
          <>
            <span>{Math.round(d.confidence * 100)}% confidence</span>
            <span>{d.latencyMs} ms</span>
          </>
        )}
        {response.uiHint && <span>{response.uiHint}</span>}
      </summary>
      {d?.reason && <p className="debug__reason">{d.reason}</p>}
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </details>
  )
}

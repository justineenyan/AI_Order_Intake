import { createContext, useContext } from 'react'

// Lets the cards deep in the message list send a reply or attach a file
// without threading callbacks through every component.
export interface ChatActions {
  send: (text: string) => void
  addFiles: (files: File[]) => void
  busy: boolean
}

export const ChatActionsContext = createContext<ChatActions>({
  send: () => {},
  addFiles: () => {},
  busy: false,
})

export const useChatActions = () => useContext(ChatActionsContext)

import { useEffect, useRef } from 'react'
import Api from './api'
import ChatRoom from './screens/ChatRoom'
import JoinRoom from './screens/JoinRoom'
import { useChatStore } from './stores/chat'
import { useSession } from './stores/session'

function App() {
  const { session } = useSession()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (session?.token) {
      Api.setBearerToken(session.token)
    } else {
      Api.setBearerToken(undefined)
    }
  }, [session])

  useEffect(() => {
    if (session && !initializedRef.current) {
      initializedRef.current = true
      useChatStore.getState().start(session)
    } else if (!session && initializedRef.current) {
      initializedRef.current = false
      useChatStore.getState().exit()
    }
  }, [session])

  return <div className="mx-auto w-full max-w-screen-sm bg-white">{session ? <ChatRoom /> : <JoinRoom />}</div>
}

export default App

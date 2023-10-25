import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type SessionStore = {
  username: string
  roomID: string
  token: string
}

const emptySession: SessionStore = {
  username: '',
  roomID: '',
  token: '',
}
const SessionContext = createContext<SessionStore>(emptySession)

type SetSessionStore = {
  setSession: React.Dispatch<React.SetStateAction<SessionStore>>
  clearSession: () => void
}
const SetSessionContext = createContext<SetSessionStore>({
  setSession: () => {},
  clearSession: () => {},
})

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState(() => {
    const storedSession = sessionStorage.getItem('session')
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession)
      return parsedSession as SessionStore
    }
    return emptySession
  })

  useEffect(() => {
    if (session !== emptySession) {
      sessionStorage.setItem('session', JSON.stringify(session))
    } else {
      sessionStorage.removeItem('session')
    }
  }, [session])

  const clearSession = useCallback(() => {
    setSession(emptySession)
  }, [])

  const setSessionContextValue = useMemo(() => ({ setSession, clearSession }), [setSession, clearSession])

  return (
    <SetSessionContext.Provider value={setSessionContextValue}>
      <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
    </SetSessionContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSession = () => {
  const session = useContext(SessionContext)
  const { setSession, clearSession } = useContext(SetSessionContext)

  return {
    session: session.username && session.roomID ? session : undefined,
    setSession,
    clearSession,
  } as const
}

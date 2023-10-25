import { useCallback, useEffect, useRef } from 'react'
import { MessageInput, MessageText, PageHeader } from '@/components/chats'
import { cn, useIsScrollingRef } from '@/lib/utils'
import { useChatStore } from '@/stores/chat'
import { useSession } from '@/stores/session'

function ChatRoom() {
  const { session, clearSession } = useSession()
  if (!session) {
    throw new Error('ChatRoom component must be rendered after session is set')
  }

  const chatBoxRef = useRef<HTMLDivElement>(null)
  const messages = useChatStore((state) => state.messages)
  const sendMessage = useChatStore((state) => state.sendMessage)
  const endChatRoom = useChatStore((state) => state.exit)
  const connected = useChatStore((state) => state.status === 'connected')
  const fetchingMessages = useChatStore((state) => state.fetchingMessages)
  const ready = connected && !fetchingMessages
  const isScrollingRef = useIsScrollingRef()

  const handleExit = useCallback(() => {
    endChatRoom()
    clearSession()
  }, [endChatRoom, clearSession])

  useEffect(() => {
    // Effect for handling Scroll to bottom after new message is added
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]

      // if the last message has temporaryId, that means it is own new message
      if (lastMessage.temporaryId !== undefined) {
        window.scrollTo({ behavior: 'smooth', top: document.body.scrollHeight })
      } else {
        // if not own message, scroll to bottom if user is already at bottom, but not if user is reading older messages
        const previousLastElement = chatBoxRef.current?.lastElementChild?.previousElementSibling
          ?.previousElementSibling as HTMLDivElement | null
        if (
          isScrollingRef.current === false &&
          previousLastElement &&
          window.scrollY + window.innerHeight - 66 >= previousLastElement.offsetTop
        ) {
          window.scrollTo({ behavior: 'smooth', top: document.body.scrollHeight })
        }
      }
    }
  }, [messages, session, isScrollingRef])

  useEffect(() => {
    if (!fetchingMessages) {
      window.scrollTo(0, document.body.scrollHeight)
    }
  }, [fetchingMessages])

  return (
    <div className="relative flex h-full flex-col">
      <PageHeader
        className="fixed inset-x-0 top-0 z-50 box-content h-[36px]"
        onClickExit={handleExit}
        title={session.roomID}
      />
      <div ref={chatBoxRef} className="relative flex h-full min-h-screen flex-col space-y-8 px-4 pb-[98px] pt-[68px]">
        {fetchingMessages ? (
          <div className="flex flex-1 animate-pulse items-center justify-center">
            <span>Fetching messages...</span>
          </div>
        ) : (
          <>
            {messages.map((message, idx) => (
              <MessageText className="peer" key={message.id ?? idx} message={message} ownUsername={session.username} />
            ))}
            <SeeNewerMessageButton
              className="pointer-events-none fixed bottom-[74px] left-1/2 z-50 -translate-x-1/2 opacity-0 transition-opacity delay-100 peer-data-[seen=false]:pointer-events-auto peer-data-[seen=false]:opacity-100"
              onClick={() => window.scrollTo({ behavior: 'smooth', top: document.body.scrollHeight })}
            />
          </>
        )}
      </div>

      {ready && <MessageInput className="fixed inset-x-0 bottom-0 w-full" onSubmit={sendMessage} />}
    </div>
  )
}

const SeeNewerMessageButton = ({
  className,
  onClick,
}: {
  className?: string
  onClick: React.MouseEventHandler<HTMLButtonElement>
}) => (
  <button
    className={cn('rounded-full border  border-gray-2 bg-white/75 px-4 py-2 text-xs', className)}
    onClick={onClick}
  >
    See Newer Message ↓
  </button>
)

export default ChatRoom

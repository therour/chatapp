import { memo, useLayoutEffect, useRef } from 'react'
import { SendIcon } from '@/components/icons'
import { cn } from '@/lib/utils'
import { ChatMessageState } from '@/types'

type PageHeaderProps = {
  onClickExit: () => void
  title: string
  className?: string
}
export const PageHeader = ({ onClickExit, title, className }: PageHeaderProps) => (
  <div
    className={cn(
      'flex items-center bg-gradient-to-b from-white from-10% to-white/50 p-4 pb-0 backdrop-blur-sm backdrop-filter',
      className,
    )}
  >
    <button
      className="w-0 font-medium text-primary-3 transition-colors hover:text-primary-4 active:text-primary-5"
      onClick={onClickExit}
    >
      Exit
    </button>
    <h1 className="mx-auto text-title">{title}</h1>
  </div>
)

type MessageInputProps = { onSubmit: (text: string) => void; className?: string }
export const MessageInput = ({ onSubmit, className }: MessageInputProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { currentTarget: target } = e
    const text = target.text.value.trim() as string
    if (!text) return

    onSubmit(text)
    target.text.value = ''
  }

  return (
    <form
      className={cn('bg-gradient-to-t from-white from-10% to-white/50 p-4 backdrop-blur-sm backdrop-filter', className)}
      onSubmit={handleSubmit}
    >
      <div className="relative">
        <input
          className="h-[50px] w-full rounded-full border  border-gray-2 bg-gray-1 p-4 pb-[15px] pr-[50px] font-medium leading-[19.36px] placeholder-gray-3 outline-none"
          name="text"
          type="text"
        />
        <button
          className="absolute bottom-2 right-2 top-2 text-primary-3 transition-colors hover:text-primary-4 active:text-primary-5"
          type="submit"
        >
          <SendIcon />
        </button>
      </div>
    </form>
  )
}

type MessageTextProps = { message: ChatMessageState; ownUsername: string; className?: string }
export const MessageText = memo<MessageTextProps>(({ message, ownUsername, className }) => {
  const ownMessage = message.username === ownUsername
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    // Add observer to check if the message element is intersecting
    // then mark the message as seen by applying data-seen="true" attribute
    if (ref.current) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              message.seen = true
              entry.target.setAttribute('data-seen', 'true')
            }
          })
        },
        { threshold: 0.25, rootMargin: '0px 0px -66px 0px' },
      )
      obs.observe(ref.current)
      return () => obs.disconnect()
    }
  }, [message])

  return (
    <div ref={ref} data-seen={message.seen ? 'true' : 'false'} className={cn('w-full', className)}>
      {!ownMessage && <div className="pl-2 text-sm">{message.username}</div>}
      <div
        className={`message w-[70%]
          ${ownMessage ? 'message-own ml-auto' : 'message-other mr-auto'}
        `}
      >
        {message.text}
      </div>
    </div>
  )
})

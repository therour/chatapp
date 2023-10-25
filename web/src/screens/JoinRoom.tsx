import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Api from '@/api'
import { useSession } from '@/stores/session'

const sessionSchema = z.object({
  username: z.string().min(1, 'Username cannot be empty'),
  roomID: z.string().min(1, 'Room ID cannot be empty'),
})

type SessionFormValues = z.infer<typeof sessionSchema>

function JoinRoom() {
  const joinButtonRef = useRef<HTMLButtonElement>(null)
  const { setSession } = useSession()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      username: '',
      roomID: '',
    },
  })
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (values: SessionFormValues) => {
    setSubmitting(true)
    try {
      const res = await Api.chatroom.join(values)
      setSession({ ...values, token: res.token })
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 422) {
        const errors = err.response.data.errors
        Object.keys(errors).forEach((key) => {
          setError(key as keyof SessionFormValues, { message: errors[key] })
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const formRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (!navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
      return
    }
    const inputs = formRef.current!.querySelectorAll('input')

    const focusInHandler = () => {
      document.body.style.setProperty('--bottom-offset', `270px`)
    }
    const focusOutHandler = () => {
      document.body.style.setProperty('--bottom-offset', `0px`)
    }

    inputs.forEach((input) => {
      input.addEventListener('focus', focusInHandler)
      input.addEventListener('blur', focusOutHandler)
    })

    return () => {
      inputs.forEach((input) => {
        input.removeEventListener('focus', focusInHandler)
        input.removeEventListener('blur', focusOutHandler)
      })
    }
  }, [])

  return (
    <div className="relative h-full min-h-[500px] p-4">
      <h1 className="text-center text-title">Join Chatroom</h1>
      <form ref={formRef} className="mt-8 grid gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <input className="input" type="text" placeholder="Username" {...register('username')} autoComplete="off" />
          {errors.username?.message ? <p className="text-sm text-red-500">{errors.username?.message}</p> : null}
        </div>
        <div className="grid gap-2">
          <input className="input" type="text" placeholder="RoomID" {...register('roomID')} autoComplete="off" />
          {errors.roomID?.message ? <p className="text-sm text-red-500">{errors.roomID?.message}</p> : null}
        </div>
        <button
          ref={joinButtonRef}
          disabled={submitting}
          className="fixed bottom-[75px] left-0 right-0 mx-4 rounded-full bg-primary-3 p-4 font-semibold uppercase text-white transition-all hover:bg-primary-4 active:bg-primary-5 disabled:bg-gray-3 supports-[-webkit-touch-callout:none]:portrait:bottom-[calc(75px_+_var(--bottom-offset,_0px))]"
          type="submit"
        >
          {submitting ? 'Joining...' : 'Join'}
        </button>
      </form>
    </div>
  )
}

export default JoinRoom

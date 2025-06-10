import { toast } from 'sonner'

const duration = 3000

export function toastSuccess(message: string) {
  return toast.success(`${message}`, {
    duration,
    style: { background: 'hsl(161.4 93.5% 30.4%)', color: '#fff' },
  })
}

export function toastError(error: Error) {
  return toast.error(`${error}`, {
    duration,
    style: { background: 'hsl(0 72.2% 50.6%)', color: '#fff' },
  })
}

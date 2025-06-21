import { toast } from 'sonner'

const duration = 3000
const warningDuration = 10000 // 警告は長め

export function toastSuccess(message: string) {
  return toast.success(`${message}`, {
    duration,
    style: { background: 'hsl(161.4 93.5% 30.4%)', color: '#fff' },
  })
}

export function toastError(message: string) {
  return toast.error(`${message}`, {
    duration,
    style: { background: 'hsl(0 72.2% 50.6%)', color: '#fff' },
  })
}

export function toastWarning(message: string) {
  return toast.warning(message, {
    duration: warningDuration,
    style: {
      background: 'hsl(45 100% 51%)',
      color: '#000',
      whiteSpace: 'pre-line',
    },
  })
}

type AlertVariant = 'error' | 'success'

interface AlertBannerProps {
  variant: AlertVariant
  message: string
}

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  error:
    'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
  success:
    'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
}

export default function AlertBanner({ variant, message }: AlertBannerProps) {
  return (
    <p
      role="alert"
      className={`rounded-xl px-4 py-3 text-sm ${VARIANT_CLASSES[variant]}`}
    >
      {message}
    </p>
  )
}

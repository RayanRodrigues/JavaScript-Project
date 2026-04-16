interface ProgressMeterProps {
  label: string
  valueText: string
  percentage: number
  tone?: 'default' | 'success'
}

const FILL_CLASSES: Record<string, string> = {
  default: 'bg-gradient-to-r from-indigo-500 to-emerald-500',
  success: 'bg-emerald-500',
}

function ProgressMeter({ label, valueText, percentage, tone = 'default' }: ProgressMeterProps) {
  const clampedPct = Math.min(100, Math.max(0, percentage))
  const fillClass = FILL_CLASSES[tone] ?? FILL_CLASSES.default

  return (
    <div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 mt-0">{label}</p>
      <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${fillClass}`}
          style={{ width: `${clampedPct}%` }}
        />
      </div>
      <span className="block mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        {valueText}
      </span>
    </div>
  )
}

export default ProgressMeter

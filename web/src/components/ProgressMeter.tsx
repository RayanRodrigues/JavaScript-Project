import './ProgressMeter.css'

interface ProgressMeterProps {
  label: string
  valueText: string
  percentage: number
  tone?: 'default' | 'success'
}

function ProgressMeter({
  label,
  valueText,
  percentage,
  tone = 'default',
}: ProgressMeterProps) {
  const fillClassName =
    tone === 'success' ? 'progress-meter__fill progress-meter__fill--success' : 'progress-meter__fill'

  return (
    <div className="progress-meter">
      <p className="progress-meter__label">{label}</p>
      <div className="progress-meter__bar">
        <div className={fillClassName} style={{ width: `${percentage}%` }} />
      </div>
      <span className="progress-meter__value">{valueText}</span>
    </div>
  )
}

export default ProgressMeter

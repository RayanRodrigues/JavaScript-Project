import './SummaryList.css'

interface SummaryListItem {
  label: string
  value: string
}

interface SummaryListProps {
  items: SummaryListItem[]
}

function SummaryList({ items }: SummaryListProps) {
  return (
    <ul className="summary-list">
      {items.map((item) => (
        <li key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </li>
      ))}
    </ul>
  )
}

export default SummaryList

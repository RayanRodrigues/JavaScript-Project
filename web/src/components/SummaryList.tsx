interface SummaryListItem {
  label: string
  value: string
}

interface SummaryListProps {
  items: SummaryListItem[]
}

function SummaryList({ items }: SummaryListProps) {
  return (
    <ul className="list-none p-0 m-0 mt-4">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex justify-between items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
        >
          <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
          <strong className="text-sm font-semibold text-slate-900 dark:text-slate-50 shrink-0">{item.value}</strong>
        </li>
      ))}
    </ul>
  )
}

export default SummaryList

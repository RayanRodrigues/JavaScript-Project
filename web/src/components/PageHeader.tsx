interface PageHeaderProps {
  title: string
  subtitle: string
}

function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 m-0">{title}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-0">{subtitle}</p>
    </div>
  )
}

export default PageHeader

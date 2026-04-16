import './PageHeader.css'

// Reusable UI component for consistent page titles and subtitles.
// Supports a cleaner interface and better user experience.

interface PageHeaderProps {
  title: string
  subtitle: string
}

function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="page-header">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  )
}

export default PageHeader
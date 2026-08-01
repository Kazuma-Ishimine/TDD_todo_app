import { useState } from 'react'

import type { GetApiV1Apps200DataItem } from '../../../api/generated/models'
import { AppCard } from './AppCard'

type Props = {
  apps: GetApiV1Apps200DataItem[]
}

/**
 * Renders a list of app cards.
 */
export function AppList({ apps }: Props) {
  const [sort, setSort] = useState<'newest' | 'oldest' | 'name'>('newest')

  if (apps.length === 0) {
    return <p className="text-gray-500 text-center py-8">No apps yet. Create your first app!</p>
  }

  const sortedApps = [...apps].sort((left, right) => {
    if (sort === 'name') return left.name.localeCompare(right.name)
    const comparison = left.createdAt.localeCompare(right.createdAt)
    return sort === 'newest' ? -comparison : comparison
  })

  return (
    <div className="space-y-4">
      <label className="flex items-center justify-end gap-2 text-sm">
        Sort apps
        <select value={sort} onChange={(event) => setSort(event.currentTarget.value as typeof sort)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name</option>
        </select>
      </label>
      {sortedApps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  )
}

import { useAtom } from 'jotai'
import { currentPageAtom } from './shared/navigation'
import { AppListPage } from './features/app-list/pages/AppListPage'
import { AppDetailPage } from './features/app-detail/pages/AppDetailPage'
import { AppCreatePage } from './features/app-create/pages/AppCreatePage'
import { AppEditPage } from './features/app-edit/pages/AppEditPage'

function App() {
  const [currentPage] = useAtom(currentPageAtom)

  return (
    <div>
      <AppListPage />
      {currentPage.name === 'app-detail' && (
        <AppDetailPage appId={currentPage.appId} />
      )}
      {currentPage.name === 'app-create' && <AppCreatePage />}
      {currentPage.name === 'app-edit' && (
        <AppEditPage appId={currentPage.appId} />
      )}
    </div>
  )
}

export default App

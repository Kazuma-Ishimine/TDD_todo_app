import { useGetApiV1Apps } from '../../../api/generated'
import { useNavigation } from '../../../shared/navigation'
import { AppList } from '../components/AppList'

export function AppListPage() {
  const { data, isLoading } = useGetApiV1Apps()
  const { currentPage, goToAppCreate } = useNavigation()

  if (currentPage.name !== 'app-list') return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const responseData = data as any
  const apps = responseData?.data?.data ?? []
  const isError = responseData?.data?.success === false

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Todo App TDD</h1>
        <button
          onClick={goToAppCreate}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Create App
        </button>
      </div>

      {isLoading && (
        <div role="status" className="text-center py-8 text-gray-500">
          Loading...
        </div>
      )}

      {isError && (
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          Failed to load apps. Please try again.
        </div>
      )}

      {!isLoading && !isError && <AppList apps={apps} />}
    </div>
  )
}

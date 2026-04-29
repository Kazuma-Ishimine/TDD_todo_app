import { useState } from 'react'
import { useGetApiV1AppsByAppId, usePutApiV1AppsByAppId } from '../../../api/generated'
import { useNavigation } from '../../../shared/navigation'
import { AppForm } from '../components/AppForm'

type Props = {
  appId: string
}

export function AppEditPage({ appId }: Props) {
  const [serverError, setServerError] = useState<string>()
  const [isHidden, setIsHidden] = useState(false)
  const { goToAppDetail } = useNavigation()
  const { data } = useGetApiV1AppsByAppId(appId)
  const mutation = usePutApiV1AppsByAppId()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const app = (data as any)?.data?.data

  if (isHidden) return null

  if (!app) {
    return <div role="status">Loading...</div>
  }

  const handleSubmit = async (values: { name: string }) => {
    setServerError(undefined)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await mutation.mutateAsync({ appId, data: { name: values.name } }) as any
      if (result?.status === 200) {
        setIsHidden(true)
        goToAppDetail(appId)
      } else if (result?.status === 409) {
        setServerError('App name already exists')
      } else if (result?.status === 422) {
        setServerError('Validation error: please check your input')
      }
    } catch {
      setServerError('An error occurred. Please try again.')
    }
  }

  const handleCancel = () => {
    setIsHidden(true)
    goToAppDetail(appId)
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit App</h1>
      <AppForm
        defaultValue={app.name}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={mutation.isPending}
        submitLabel="Update"
        serverError={serverError}
      />
    </div>
  )
}

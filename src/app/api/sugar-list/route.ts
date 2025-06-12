import { ApiService } from '@/lib/apiService'
import { getToken } from '@/lib/token'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const listName = searchParams.get('name')
  const moduleName = searchParams.get('module') || 'Contacts'

  if (!listName) {
    return new Response(JSON.stringify({ error: 'Falta el nombre de la lista (name)' }), { status: 400 })
  }

  try {
    const token = await getToken()
    const api = new ApiService(process.env.API_URL!, token)

    const data = await api.get<any>(`/rest/v11/${moduleName}/enum/${listName}`)
    console.log('📡 Datos obtenidos de SugarCRM:', data)
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'Error al obtener la lista', detail: err.message }),
      { status: 500 }
    )
  }
}
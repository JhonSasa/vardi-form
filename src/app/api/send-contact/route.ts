// app/api/send-contact/route.ts
import { ApiService } from '@/lib/apiService'

export async function POST(req: Request) {
  const formData = await req.json()

  const {
    API_URL,
    GRANT_TYPE,
    CLIENT_ID,
    CLIENT_SECRET,
    USERNAME,
    PASSWORD,
    PLATFORM,
  } = process.env

  if (!API_URL || !USERNAME || !PASSWORD) {
    return new Response(JSON.stringify({ error: 'Faltan variables de entorno' }), { status: 500 })
  }

  try {
    // 1. Obtener el token usando ApiService (sin token inicial)
    const authApi = new ApiService(API_URL)
    const tokenResponse = await authApi.post<{ access_token: string }>('/rest/v11/oauth2/token', {
      grant_type: GRANT_TYPE,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      username: USERNAME,
      password: PASSWORD,
      platform: PLATFORM,
    })

    const token = tokenResponse.access_token

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token no recibido' }), { status: 401 })
    }

    // 2. Crear contacto usando el token
    const contactApi = new ApiService(API_URL, token)

    const sugarResponse = await contactApi.post('/rest/v11/Contacts', {
      first_name: formData.name,
      last_name: 'Formulario Web',
      email: [{ email_address: formData.email, primary_address: true }],
      description: formData.message,
    })

    return new Response(JSON.stringify({ message: 'Contacto creado en SugarCRM', sugarResponse }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Error en el proceso', detail: error.message }), {
      status: 500,
    })
  }
}

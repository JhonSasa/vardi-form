// app/api/login/route.ts
/*export async function POST() {
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
    return new Response(
      JSON.stringify({ error: 'Faltan variables de entorno obligatorias' }),
      { status: 500 }
    )
  }

  try {
    const response = await fetch(`${API_URL}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: GRANT_TYPE,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        username: USERNAME,
        password: PASSWORD,
        platform: PLATFORM,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), { status: response.status })
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Error interno al conectarse a SugarCRM' }),
      { status: 500 }
    )
  }
}*/

// app/api/login/route.ts
/*import { ApiService } from '@/lib/apiService'

export async function POST() {
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
    return new Response(
      JSON.stringify({ error: 'Faltan variables de entorno obligatorias' }),
      { status: 500 }
    )
  }

  const api = new ApiService(API_URL) // Sin token todavía

  try {
    const tokenData = await api.post('/rest/v11/oauth2/token', {
      grant_type: GRANT_TYPE,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      username: USERNAME,
      password: PASSWORD,
      platform: PLATFORM,
    })

    return new Response(JSON.stringify(tokenData), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Error al obtener el token', detail: error.message }),
      { status: 500 }
    )
  }
}*/

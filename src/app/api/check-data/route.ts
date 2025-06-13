// src/app/api/check-data/route.ts
import { ApiService } from '@/lib/apiService'
import { getToken } from '@/lib/token'

export async function POST(req: Request) {
  const body = await req.json()
  const { tipoDocumento, numeroDocumento } = body
  
  if (!tipoDocumento || !numeroDocumento) {
    return new Response(JSON.stringify({ error: 'Faltan campos' }), { status: 400 })
  }

  try {
    const token = await getToken()
    console.log('🔑 Token obtenido:', token)
    const api = new ApiService(process.env.API_URL!, token)

    // Tipado genérico para la respuesta esperada
    type SugarResponse = {
      records?: any[]
    }


    // 1. Buscar contacto
    const contactos = await api.post<SugarResponse>('/rest/v11/Contacts/filter?fields=id,date_modified', {
      filter: [
        {
          sasa_tipo_documento_c: tipoDocumento,
          sasa_numero_documento_c: numeroDocumento,
        },
      ],
      max_num: 1,
    })

    // 2. Buscar cuenta
    const cuentas = await api.post<SugarResponse>('/rest/v11/Accounts/filter?fields=id,date_modified', {
      filter: [
        {
          sasa_tipo_documento_c: tipoDocumento,
          sasa_numero_documento_c: numeroDocumento,
        },
      ],
      max_num: 1,
    })

    return new Response(
      JSON.stringify({
        contacto: contactos.records?.[0] || null,
        cuenta: cuentas.records?.[0] || null,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Error en la consulta', detail: error.message }),
      { status: 500 }
    )
  }
}

// app/api/send-contact/route.ts
import { ApiService } from '@/lib/apiService'
//import { getToken } from '@/lib/token'
import { getToken } from '@/lib/token'

export async function POST(req: Request) {
  const formData = await req.json()


  try {
    // 1. Obtener el token usando ApiService (sin token inicial)
    const token = await getToken()

    // 2. Crear contacto usando el token
    const api = new ApiService(process.env.API_URL!, token)
    const hayCanales = formData.canales_autorizados && formData.canales_autorizados.replace(/\^/g, '').trim() !== ''
    const payload = {
        sasa_tipo_de_persona_c: 'N',
        sasa_tipo_documento_c: formData.tipo_documento,
        sasa_numero_documento_c: formData.numero_documento,
        sasa_nombres_c: formData.name,
        sasa_primerapellido_c: formData.primer_apellido,
        sasa_last_name_2_c: formData.segundo_apellido,
        sasa_phone_mobile_c: formData.celular || '',
        sasa_cel_alternativo_c: formData.celular_alternativo || '',
        sasa_tipo_solicitud_c: formData.sasa_tipo_solicitud_c || '',
        sasa_compania_c: 2,
        sasa_unidad_de_negocio_c: 210,
        sasa_marcacion_ad_c: 1,
        email: [
          {
            email_address: formData.email,
            primary_address: true,
            'email.opt_out': false,
          },
        ],
        data: {
          sasa_nombres_ad_c: formData.name,
          sasa_primerapellido_ad_c: formData.primer_apellido,
          sasa_last_name_2_ad_c: formData.segundo_apellido,
          sasa_placa_ad_c: formData.placas,
          sasa_cel_principal_ad_c: formData.celular,
          sasa_cel_alternativo_ad_c: formData.celular_alternativo,
          sasa_email_ad_c: formData.email,
          sasa_marcacion_ad_c: 1,
        },
        documents_sasa_habeas_data_1documents_ida: 'cc60bd44-c2fd-11eb-99ce-0630baf9dcb8',
        contacts_sasa_habeas_data_1contacts_ida: '', // puedes completar si ya tienes el contacto
        leads_sasa_habeas_data_1leads_ida: '',
        sasa_estado_autorizacion_c: 1,
        sasa_auto_contactacion_c: hayCanales ? '2' : '1',
        sasa_canales_autorizados_c: hayCanales ? formData.canales_autorizados : '',
      }

      const sugarResponse = await api.post('/rest/v11/Api_update_data', payload)

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

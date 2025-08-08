// app/api/send-contact/route.ts
import { ApiService } from '@/lib/apiService'
//import { getToken } from '@/lib/token'
import { getToken } from '@/lib/token'


// 🔹 Función utilitaria: toma la IP cruda (puede venir con lista o con ::ffff:)
// y devuelve la IP "limpia" (primera de la lista y sin el prefijo ::ffff:)
function limpiarIP(ipRaw?: string | null): string {
  if (!ipRaw) return 'IP no disponible'
  const first = ipRaw.split(',')[0].trim() // si viene "ip1, ip2, ip3"
  return first.replace(/^::ffff:/i, '')    // quita el prefijo IPv4-mapeada
}

export async function POST(req: Request) {
  const formData = await req.json()

  // 🔍 1. Capturar y normalizar la IP del usuario desde headers
  const ip = limpiarIP(
    req.headers.get('x-forwarded-for') || // típico en Vercel/Proxies
    req.headers.get('x-real-ip')          // común en Nginx
  )

  try {
    // 1. Obtener el token usando ApiService (sin token inicial)
    const token = await getToken()

    // 2. Crear contacto usando el token
    const api = new ApiService(process.env.API_URL!, token)

      // Determinar valores según lógica de negocio
      let sasa_auto_contactacion_c = '1'
      let sasa_canales_autorizados_c = ''

      if (formData.canales_autorizados === 'ninguno') {
        sasa_auto_contactacion_c = '2'
        sasa_canales_autorizados_c = '^0^'
      } else if (formData.canales_autorizados === 'todos') {
        sasa_auto_contactacion_c = '1'
        sasa_canales_autorizados_c = ''
      } else {
        sasa_auto_contactacion_c = '2'
        sasa_canales_autorizados_c = formData.canales_autorizados
      }

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
        cd_area_c:21010,
        lead_source:20,
        sasa_detalle_origen_c:25,
        sasa_marcacion_ad_c: 1,
        email: [
          {
            email_address: formData.email,
            primary_address: true,
            'email.opt_out': false,
          },
        ],
        sasa_placa_ad_c: formData.placas,
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
        sasa_revision_c:'V',
        sasa_fuente_autorizacion_c:'W',
        sasa_auto_contactacion_c,
        sasa_canales_autorizados_c,
        sasa_ip_usuario_c:ip,
        sasa_proceso_hb_c:'Actualizacion Datos',
        description:'Ingreso por formulario actualización de datos'
      }

      const sugarResponse = await api.post('/rest/v11/Api_update_data', payload)

    return new Response(JSON.stringify({ message: 'Contacto creado en SugarCRM', sugarResponse }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      return new Response(JSON.stringify({ error: 'Error en el proceso', detail: message }), {
        status: 500,
    })
  }
}

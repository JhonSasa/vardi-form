'use client'

import { useState, useEffect } from 'react'

export default function HomePage() {
  type ContactoInfo = {
    id: string
    date_modified: string
  }
  type SendContactResponse = {
    message: string
    sugarResponse: unknown
  } | {
    error: string
    detail: string
  }
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
    tipo_documento: '',
    numero_documento: '',
    primer_apellido: '',
    segundo_apellido: '',
    celular: '',
    celular_alternativo: '',
    sasa_tipo_solicitud_c: '',
    placa: ''
  })
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [listas, setListas] = useState<{ [key: string]: { [key: string]: string } }>({})
  const [contactoInfo, setContactoInfo] = useState<ContactoInfo | null>(null)
  const [autorizoDatos, setAutorizoDatos] = useState(false)
  const [canalesSeleccionados, setCanalesSeleccionados] = useState<string[]>([])
  const canalesExcluidos = ['NINGUNA', 'OFICINA', 'FAX', '', 'DIRECCIÓN FÍSICA', 'TELÉFONO FIJO', 'PERSONALMENTE']
  const [placas, setPlacas] = useState<string[]>([''])

  const handlePlacaChange = (index: number, value: string) => {
    const nuevasPlacas = [...placas]
    nuevasPlacas[index] = value
    setPlacas(nuevasPlacas)
  }

  const agregarPlaca = () => {
    if (placas.length < 5) {
      setPlacas([...placas, ''])
    }
  }

  const checkDocumento = async () => {
  console.log('👤 Verificando documento:', form.tipo_documento, form.numero_documento)
 
  const res = await fetch('/api/check-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipoDocumento: form.tipo_documento,
        numeroDocumento: form.numero_documento,
      }),
    })

    const data = await res.json()
    console.log('👤 Resultado:', data)
    setContactoInfo(data.contacto || null)
    // Aquí puedes setear visibilidad de campos si data.contacto o data.cuenta existe
  }

  useEffect(() => {
    checkDocumento()
  }, [form.tipo_documento, form.numero_documento])

  useEffect(() => {
    const cargarListas = async () => {
      const [docRes, solicitudRes, canalesRes] = await Promise.all([
      fetch('/api/sugar-list?name=sasa_tipo_documento_c&module=Contacts'),
      fetch('/api/sugar-list?name=sasa_tipo_solicitud_c&module=Leads'),
      fetch('/api/sugar-list?name=sasa_canales_autorizados_c&module=SASA_Habeas_Data'),
      ])

    const [tipoDoc, tipoSolicitud, canales] = await Promise.all([
      docRes.json(),
      solicitudRes.json(),
      canalesRes.json(),
    ])

    setListas({
        tipo_documento: tipoDoc,
        tipo_solicitud: tipoSolicitud,
        canales_autorizados: canales,
      })
    }

    cargarListas()
  }, [])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)
    setLoading(true)

    const payload = {
      ...form,
      autorizoDatos,
      placas: placas.filter(p => p.trim() !== '').join(','),
      canales_autorizados: canalesSeleccionados.map(val => `^${val}^`).join(','),
    }

    console.log('📦 Payload que se enviará:', payload)

    try {
        const res = await fetch('/api/send-contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const contentType = res.headers.get('Content-Type') || ''

        let result: SendContactResponse

        if (contentType.includes('application/json')) {
          result = await res.json()
        } else {
          const text = await res.text()
          console.error('⚠️ Respuesta inesperada del servidor:', text)
          throw new Error('Respuesta inesperada del servidor. Intenta más tarde.')
        }

        if (!res.ok) {
          if ('error' in result) {
            throw new Error(result.error)
          }
          throw new Error('No se pudo enviar')
        }

        setStatus('✅ Contacto enviado a SugarCRM')
        //setForm({ name: '', email: '', message: '' })
        console.log('📨 Respuesta SugarCRM:', result)
      } catch (error) {
          if (error instanceof Error) {
            setStatus(`❌ Error al enviar: ${error.message}`)
          } else {
            setStatus('❌ Error desconocido al enviar')
          }
      } finally {
        setLoading(false)
      }
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <div className="flex justify-center mb-4">
        <img src="/Nissan_2020_logo.svg" alt="Logo Nissan" className="h-16" />
      </div>
      <h1 className="text-2xl font-bold mb-4 text-center">ACTUALIZACIÓN DE DATOS NISSAN</h1>
      <p className="text-sm text-gray-600 mb-4">
        Te invitamos a que actualices tus datos para que sigamos en contacto, fundamental para tu vehículo y conozcas de nuestras promociones y oferas espaciales para que tu NISSAN te acompañe mucho mas kilometros.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
      {contactoInfo && (
          <div className="mt-4 p-4 border rounded bg-red-100 text-sm">
            <p><strong>Última modificación:</strong> {contactoInfo.date_modified}</p>
          </div>
        )}
      <select
        name="tipo_documento"
        value={form.tipo_documento}
        onChange={handleChange}
        className="w-full border p-2 rounded"
        required
      >
        <option value="">Selecciona tipo de documento</option>
        {listas.tipo_documento &&
          Object.entries(listas.tipo_documento).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
          <input
            type="text"
            name="numero_documento"
            placeholder="Número de documento"
            value={form.numero_documento}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Nombres"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        <div className="flex gap-4">
          <input
            type="text"
            name="primer_apellido"
            placeholder="Primer Apellido"
            value={form.primer_apellido}
            onChange={handleChange}
            className="w-1/2 border p-2 rounded"
            required
          />
          <input
            type="text"
            name="segundo_apellido"
            placeholder="Segundo Apellido"
            value={form.segundo_apellido}
            onChange={handleChange}
            className="w-1/2 border p-2 rounded"
            
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Placas</label>
          {placas.map((placa, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Placa ${index + 1}`}
              value={placa}
              onChange={(e) => handlePlacaChange(index, e.target.value)}
              className="w-full mb-2 border p-2 rounded text-sm"
            />
          ))}
          {placas.length < 5 && (
            <button
              type="button"
              onClick={agregarPlaca}
              className="text-sm text-blue-600 hover:underline"
            >
              + Tengo otro vehículo
            </button>
          )}
        </div> 

        {!contactoInfo && (
          <select
            name="sasa_tipo_solicitud_c"
            value={form.sasa_tipo_solicitud_c || ''}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Selecciona tipo de solicitud</option>
            {listas.tipo_solicitud &&
              Object.entries(listas.tipo_solicitud).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
          </select>
        )}

        <div className="flex gap-4">
          <input
            type="text"
            name="celular"
            placeholder="Celular"
            value={form.celular}
            onChange={handleChange}
            className="w-1/2 border p-2 rounded"
            required
          />
          <input
            type="text"
            name="celular_alternativo"
            placeholder="Celular Alternativo"
            value={form.celular_alternativo}
            onChange={handleChange}
            className="w-1/2 border p-2 rounded"
            
          />
        </div>

        <input
          type="email"
          name="email"
          placeholder="Tu correo"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
          
        <label className="flex items-center space-x-2 text-sm text-gray-700">
          <input
            type="checkbox"
            id="cbox1"
            checked={autorizoDatos}
            onChange={(e) => setAutorizoDatos(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <span>Autorizo el tratamiento de mis datos personales</span>
        </label>
        <p className="text-sm text-gray-600 mb-4">Te invitamos a leer la finalidad sobre tus datos personales, contenidos en la <a href="https://www.nissan.com.co/privacidad.html" target='_blank' className="text-blue-600 hover:underline">política de información de Dinissan</a>.</p>
        {autorizoDatos && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Canales autorizados
            </label>
            <div className="grid gap-2">
              {listas.canales_autorizados &&
                Object.entries(listas.canales_autorizados)
                  .filter(([, label]) => !canalesExcluidos.includes(label))
                  .map(([key, label]) => {
                    const selected = canalesSeleccionados.includes(key)
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          const updated = selected
                            ? canalesSeleccionados.filter((v) => v !== key)
                            : [...canalesSeleccionados, key]

                          console.log('📋 Canales actualizados:', updated)
                          setCanalesSeleccionados(updated)
                        }}
                        className={`text-xs px-2 py-1 rounded border transition ${
                          selected
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-gray-700 border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 display-block w-full text-center transition duration-200 disabled:cursor-not-allowed"
          
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>

      {status && <p className="mt-4 text-sm">{status}</p>}
    </main>
  )
}

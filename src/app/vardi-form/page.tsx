'use client'

import { useState, useEffect } from 'react'

export default function HomePage() {
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
  const [contactoInfo, setContactoInfo] = useState<any>(null)
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


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

        const result = await res.json()

        if (!res.ok) {
          throw new Error(result.error || 'No se pudo enviar')
        }

        setStatus('✅ Contacto enviado a SugarCRM')
        //setForm({ name: '', email: '', message: '' })
        console.log('📨 Respuesta SugarCRM:', result.sugarResponse)
      } catch (error: any) {
        setStatus(`❌ Error al enviar: ${error.message}`)
      } finally {
        setLoading(false)
      }
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Formulario de contacto</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
      {contactoInfo && (
          <div className="mt-4 p-4 border rounded bg-gray-50 text-sm">
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
            required
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
              + Agregar otra placa
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
            required
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
          />
          <span>Autorizo Datos Personales</span>
        </label>
        
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
                            ? 'bg-blue-600 text-white border-blue-600'
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>

      {status && <p className="mt-4 text-sm">{status}</p>}
    </main>
  )
}

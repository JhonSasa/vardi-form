'use client'

import { useState, useEffect } from 'react'

export default function HomePage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [listas, setListas] = useState<{ [key: string]: { [key: string]: string } }>({})

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

    // Aquí puedes setear visibilidad de campos si data.contacto o data.cuenta existe
  }

  useEffect(() => {
    checkDocumento()
  }, [form.tipo_documento, form.numero_documento])
  useEffect(() => {
    const cargarListas = async () => {
      const res = await fetch('/api/sugar-list?name=sasa_tipo_documento_c&module=Contacts')
      const data = await res.json()
      console.log('📋 Listas obtenidas de SugarCRM:', data)
      setListas((prev) => ({ ...prev, tipo_documento: data }))
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

    try {
        const res = await fetch('/api/send-contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })

        const result = await res.json()

        if (!res.ok) {
          throw new Error(result.error || 'No se pudo enviar')
        }

        setStatus('✅ Contacto enviado a SugarCRM')
        setForm({ name: '', email: '', message: '' })
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
          placeholder="Tu nombre"
          value={form.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Tu correo"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        <textarea
          name="message"
          placeholder="Tu mensaje"
          value={form.message}
          onChange={handleChange}
          className="w-full border p-2 rounded h-32"
          required
        />
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

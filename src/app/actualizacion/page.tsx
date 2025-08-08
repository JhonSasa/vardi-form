'use client'
import ReCAPTCHA from 'react-google-recaptcha'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import AvisoPrivacidad from './AvisoPrivacidad' // ajusta la ruta si es diferente

export default function HomePage() {
const [siteKey, setSiteKey] = useState<string>('') // Estado para el sitekey
const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
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
  const canalesExcluidos = ['OFICINA', 'FAX', '', 'DIRECCIÓN FÍSICA', 'TELÉFONO FIJO', 'PERSONALMENTE', 'NINGUNA']
  const tiposExcluidos = ['NIT', 'NO IDENTIFICADO','']
  const solicitudesExcluidas = ['SOLICITUD TEST DRIVE', 'SOLICITUD INFORMACIÓN ADMINISTRATIVA','INFORMACIÓN EVENTO', 'PENDIENTE DE CLASIFICAR', 'INFORMACIÓN COTIZACIÓN USADOS' , 'INFORMACIÓN PRECIO DE VEHÍCULOS', 'INFORMACIÓN COTIZACIÓN  VEHÍCULOS NUEVOS', 'SOLICITUD INFORMACIÓN VEHÍCULOS', '', 'INFORMACIÓN COTIZACIÓN SEGURO DE AUTOS']
  const [placas, setPlacas] = useState<string[]>([''])
  const [modoCanal, setModoCanal] = useState<'todos' | 'ninguno' | 'algunos' | null>(null)

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
 
  const res = await fetch('/api/check-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipoDocumento: form.tipo_documento,
        numeroDocumento: form.numero_documento,
      }),
    })

    const data = await res.json()

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

  useEffect(() => {
    fetch('/api/env')
      .then(res => res.json())
      .then(data => {

        setSiteKey(data.sitekey);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  const onChangeRecaptcha = (token: string | null) => {

    setRecaptchaToken(token)
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)
    setLoading(true)
  

    const payload = {
      ...form,
      autorizoDatos,
      placas: placas.filter(p => p.trim() !== '').join(','),
      canales_autorizados: modoCanal === 'todos'
        ? 'todos'
        : modoCanal === 'ninguno'
        ? 'ninguno'
        : canalesSeleccionados.map(val => `^${val}^`).join(','),

    }
    // Validar placa
    if (placas.filter(p => p.trim() !== '').length === 0) {
      toast.error('❌ Debes ingresar al menos una placa.', {
        duration: 8000,
        position: 'top-right',
      })
      setLoading(false)
      return
    }
    const placasInvalidas = placas.filter(p => !/^[A-Za-z][A-Za-z0-9]{5}$/.test(p))
    if (placasInvalidas.length > 0) {
      toast.error('❌ Cada placa debe comenzar con una letra y tener máximo 6 caracteres', {
        duration: 8000,
        position: 'top-right',
      })
      setLoading(false)
      return
    }
    if (!/^3\d{9}$/.test(form.celular)) {
      toast.error('❌ El celular debe comenzar por 3 y tener 10 dígitos', {
        duration: 8000,
        position: 'top-right',
      })
      setLoading(false)
      return
    }

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

        //setStatus('✅ Contacto enviado a SugarCRM')
        toast.success('Hemos recibido tu información correctamente',{
          duration: 8000,
          position: 'top-right',
          style: {
            background: '#f0f4c3',
            color: '#33691e',
            fontWeight: 'bold',
          },
        })

        // Resetear formulario después del envío exitoso
        setForm({
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
        setPlacas([''])
        setAutorizoDatos(false)
        setCanalesSeleccionados([])
        setRecaptchaToken(null)
        setContactoInfo(null)
        //setForm({ name: '', email: '', message: '' })

      } catch (error) {
          if (error instanceof Error) {
            //setStatus(`❌ Error al enviar: ${error.message}`)
            toast.error(`❌ ${error.message}`,{
              duration: 8000,
              position: 'top-right',
            })
          } else {
            toast.error('❌ Error desconocido al enviar', {
              duration: 8000,
              position: 'top-right',
            })
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
      <h1 className="text-2xl font-nissanBold mb-4 text-center">ACTUALIZACIÓN DE DATOS NISSAN</h1>
      <p className="text-sm text-gray-600 mb-4 text-2xl">
        Actualizar tu información es fundamental para mantenernos en contacto, acompañarte en el cuidado de tu vehículo y que puedas acceder a todos nuestros productos, servicios y beneficios exclusivos, para que disfrutes de tu <b className='font-nissanBold'>NISSAN</b> por muchos más kilómetros.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
      {contactoInfo && (
          <div className="mt-4 p-4 border bg-red-100 text-sm">
            <p><strong>Última modificación:</strong> {contactoInfo.date_modified}</p>
          </div>
        )}
      <label className="block text-sm font-medium text-gray-700 mb-1 font-nissanBold">Tipo de Documento <span className="vardi-color">*</span></label>
      <div className="relative w-full">
        <select
          name="tipo_documento"
          value={form.tipo_documento}
          onChange={handleChange}
          className="appearance-none w-full border p-2 pr-10 font-nissanLight text-sm"
          required
        >
          <option value="">Selecciona tipo de documento</option>
          {listas.tipo_documento &&
            Object.entries(listas.tipo_documento)
              .filter(([, label]) => !tiposExcluidos.includes(label))
              .map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-2">
          <div className="border-l border-gray-300 h-5 mr-2" />
          <svg
            className="w-4 h-4 vardi-color"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 12a1 1 0 0 1-.7-.29l-3-3a1 1 0 0 1 1.4-1.42L10 9.58l2.3-2.3a1 1 0 1 1 1.4 1.42l-3 3A1 1 0 0 1 10 12z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
        <label className="block text-sm font-medium text-gray-700 mb-1 font-nissanBold">Número de Documento <span className="vardi-color">*</span></label>
          <input
            type="text"
            name="numero_documento"
            placeholder="Número de documento"
            value={form.numero_documento}
            onChange={handleChange}
            className="w-full border p-2"
            required
          />
          <label className="block text-sm font-medium text-gray-700 mb-1 font-nissanBold">Nombres <span className="vardi-color">*</span></label>
          <input
            type="text"
            name="name"
            placeholder="Nombres"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2"
            required
          />

          <div className="flex gap-4">
            <div className="flex flex-col w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1 font-nissanBold">
                Primer apellido <span className="vardi-color">*</span>
              </label>
              <input
                type="text"
                name="primer_apellido"
                placeholder="Primer Apellido"
                value={form.primer_apellido}
                onChange={handleChange}
                className="border p-2"
                required
              />
            </div>

            <div className="flex flex-col w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1 font-nissanBold">
                Segundo apellido
              </label>
              <input
                type="text"
                name="segundo_apellido"
                placeholder="Segundo Apellido"
                value={form.segundo_apellido}
                onChange={handleChange}
                className="border p-2"
              />
            </div>
          </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 font-nissanBold">Placas <span className="vardi-color">*</span></label>
          {placas.map((placa, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder={`Placa ${index + 1}`}
                value={placa}
                onChange={(e) => handlePlacaChange(index, e.target.value)}
                className="flex-1 border p-2 text-sm"
                required={index === 0}
                pattern="^[A-Za-z][A-Za-z0-9]{5}$"
                title="Debe empezar con una letra y tener máximo 6 caracteres"
              />

              {/* Botón + solo en el último campo */}
              {index === placas.length - 1 && placas.length < 5 && (
                <button
                  type="button"
                  onClick={agregarPlaca}
                  title="Agregar otra placa"
                  className="px-2 py-1 border border-green-500 bg-green-100 text-green-700 hover:bg-green-200 transition"
                >
                  +
                </button>
              )}

              {/* Botón - si hay más de una placa */}
              {placas.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const nuevas = placas.filter((_, i) => i !== index)
                    setPlacas(nuevas)
                  }}
                  title="Eliminar esta placa"
                  className="px-2 py-1 border border-red-500 bg-red-100 text-red-700 hover:bg-red-200 transition"
                >
                  −
                </button>
              )}
            </div>
          ))}
        </div>

        {!contactoInfo && (
        <div className="flex flex-col relative w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1 font-nissanBold">
            Tipo de solicitud <span className="vardi-color">*</span>
          </label>

          <div className="relative">
            <select
              name="sasa_tipo_solicitud_c"
              value={form.sasa_tipo_solicitud_c || ''}
              onChange={handleChange}
              className="appearance-none w-full border p-2 pr-10 font-nissanLight text-sm"
              required
            >
              <option value="">Selecciona tipo de solicitud</option>
              {listas.tipo_solicitud &&
                Object.entries(listas.tipo_solicitud)
                  .filter(([, label]) => !solicitudesExcluidas.includes(label))
                  .map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
            </select>

            {/* Línea divisoria y flecha, perfectamente centradas */}
            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
              <div className="border-l border-gray-300 h-5 mr-2" />
              <svg
                className="w-4 h-4 vardi-color"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 12a1 1 0 0 1-.7-.29l-3-3a1 1 0 0 1 1.4-1.42L10 9.58l2.3-2.3a1 1 0 1 1 1.4 1.42l-3 3A1 1 0 0 1 10 12z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
        )}

        <div className="flex gap-4">
          <div className="flex flex-col w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1 font-nissanBold">Celular <span className="vardi-color">*</span></label>
            <input
              type="text"
              name="celular"
              placeholder="Celular"
              value={form.celular}
              onChange={handleChange}
              className="border p-2"
              pattern="3[0-9]{9}"
              title="Debe comenzar por 3 y tener 10 dígitos"
              required
            />
          </div>
          <div className="flex flex-col w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1 font-nissanBold">Celular Alternativo</label>
              <input
                type="text"
                name="celular_alternativo"
                placeholder="Celular Alternativo"
                value={form.celular_alternativo}
                onChange={handleChange}
                className="border p-2"
                pattern="3[0-9]{9}"
                title="Debe comenzar por 3 y tener 10 dígitos"
              />
          </div>
        </div>
        <label className="block text-sm font-medium text-gray-700 mb-1 font-nissanBold">Correo electrónico <span className="vardi-color">*</span></label>
        <input
          type="email"
          name="email"
          placeholder="Tu correo"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2"
          required
        />
        <p>Autorización de tratamiento de datos personales</p>
        <label className="flex items-center space-x-2 text-sm text-gray-700">
          <input
            type="checkbox"
            id="cbox1"
            checked={autorizoDatos}
            onChange={(e) => setAutorizoDatos(e.target.checked)}
            className="custom-checkbox"
            required
          />
          <span>He leído y acepto las Políticas de Privacidad <span className="vardi-color">*</span></span>
        </label>
        {autorizoDatos && (
            <AvisoPrivacidad />
        )}
        
        {autorizoDatos && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Canales autorizados
            </label>

            <div className="flex justify-center gap-4 mb-4 mt-4">
              <button
                type="button"
                onClick={() => {
                  setModoCanal('todos')
                  setCanalesSeleccionados([])
                }}
                className={`text-sm px-4 py-2 border ${
                  modoCanal === 'todos' ? 'bg-vardi-color text-white' : 'bg-white text-gray-700'
                }`}
              >
                Todos
              </button>

              <button
                type="button"
                onClick={() => {
                  setModoCanal('ninguno')
                  setCanalesSeleccionados([])
                }}
                className={`text-sm px-4 py-2 border ${
                  modoCanal === 'ninguno' ? 'bg-vardi-color text-white' : 'bg-white text-gray-700'
                }`}
              >
                Ninguno
              </button>

              <button
                type="button"
                onClick={() => {
                  setModoCanal('algunos')
                  setCanalesSeleccionados([])
                }}
                className={`text-sm px-4 py-2 border ${
                  modoCanal === 'algunos' ? 'bg-vardi-color text-white' : 'bg-white text-gray-700'
                }`}
              >
                Algunos
              </button>
            </div>

            {modoCanal === 'algunos' && (
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
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
                            setCanalesSeleccionados(updated)
                          }}
                          className={`text-xs px-2 py-2 border transition ${
                            selected
                              ? 'bg-vardi-color text-white border-red-600'
                              : 'bg-white text-gray-700 border-gray-300'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })}
              </div>
            )}
          </div>
        )}

        {siteKey ? (
          <div className="flex justify-center mt-4">
            <ReCAPTCHA 
              sitekey={siteKey}
              onChange={onChangeRecaptcha}
              className="mt-4"
            />
          </div>
        ) : (
          <div className="flex justify-center mt-4">
            <p className="text-sm text-gray-500">Cargando reCAPTCHA...</p>
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !recaptchaToken}
          className="bg-vardi-color text-white px-4 py-2 hover:bg-red-700 disabled:opacity-50 display-block w-full text-center transition duration-200 disabled:cursor-not-allowed"
          
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
        <div><span className="vardi-color">*</span>Campos obligatorios</div>
      </form>

      {status && <p className="mt-4 text-sm">{status}</p>}
    </main>
  )
}

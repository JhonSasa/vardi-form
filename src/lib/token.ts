import { ApiService } from './apiService'

type TokenCache = {
  token: string
  expiresAt: number
}

type GlobalWithToken = typeof globalThis & {
  [key: string]: TokenCache
}

const cacheKey = '__sugarcrm_token__'

async function fetchToken(): Promise<string> {
  const {
    API_URL,
    GRANT_TYPE,
    CLIENT_ID,
    CLIENT_SECRET,
    USERNAME,
    PASSWORD,
    PLATFORM,
  } = process.env

  if (!API_URL || !GRANT_TYPE || !CLIENT_ID || !USERNAME || !PASSWORD || !PLATFORM) {
    throw new Error('❌ Variables de entorno incompletas para autenticación SugarCRM')
  }

  const api = new ApiService(API_URL)

  console.log('🔐 Solicitando nuevo token a SugarCRM...')

  try {
    const result = await api.post<{ access_token: string; expires_in: number }, Record<string, string>>(
      '/rest/v11/oauth2/token',
      {
        grant_type: GRANT_TYPE,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET || '',
        username: USERNAME,
        password: PASSWORD,
        platform: PLATFORM,
      }
    )

    const expiresAt = Date.now() + (result.expires_in - 60) * 1000

    const tokenData: TokenCache = {
      token: result.access_token,
      expiresAt,
    }

    ;(globalThis as GlobalWithToken)[cacheKey] = tokenData

    console.log('✅ Nuevo token almacenado en cache:', result.access_token)

    return result.access_token
  } catch (err) {
    const error = err as Error
    console.error('❌ Error al obtener el token:', error.message)
    throw error
  }
}

export async function getToken(): Promise<string> {
  const tokenData: TokenCache | undefined = (globalThis as GlobalWithToken)[cacheKey]

  if (tokenData && Date.now() < tokenData.expiresAt) {
    console.log('♻️ Usando token desde cache', tokenData.token)
    return tokenData.token
  }

  return await fetchToken()
}

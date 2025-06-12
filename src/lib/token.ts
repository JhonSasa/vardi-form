import { ApiService } from './apiService'

type TokenCache = {
  token: string
  expiresAt: number
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

  const api = new ApiService(API_URL!)
  console.log('🔐 Intentando obtener token con:', {
    GRANT_TYPE,
    CLIENT_ID,
    CLIENT_SECRET,
    USERNAME,
    PASSWORD,
    PLATFORM,
  })

  try {
    const result = await api.post<{ access_token: string; expires_in: number }>(
      '/rest/v11/oauth2/token',
      {
        grant_type: GRANT_TYPE,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
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

    ;(globalThis as any)[cacheKey] = tokenData

    console.log('✅ Token obtenido correctamente:', result.access_token)

    return result.access_token
  } catch (err: any) {
    console.error('❌ Error al obtener el token:', err.message || err)
    throw err
  }
}

export async function getToken(): Promise<string> {
  const tokenData: TokenCache | undefined = (globalThis as any)[cacheKey]

  if (tokenData && Date.now() < tokenData.expiresAt) {
    return tokenData.token
  }
 console.log('🔁 Reusando token desde cache:', tokenData)
  return await fetchToken()
}

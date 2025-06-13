
// lib/apiService.ts
export class ApiService {
  private baseUrl: string
  private token?: string

  constructor(baseUrl: string, token?: string) {
    this.baseUrl = baseUrl
    this.token = token
  }

  private getHeaders(extraHeaders?: Record<string, string>): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...extraHeaders,
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  async get<T>(endpoint: string): Promise<T> {
    console.log('📡 GET a:', `${this.baseUrl}${endpoint}`)
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(
        errorData?.error || `Error ${response.status}: ${response.statusText}`
      )
    }

    return await response.json()
  }


  async post<T, B = unknown>(endpoint: string, body: B): Promise<T> {
    console.log('📡 POST a:', `${this.baseUrl}${endpoint}`)
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    })

  if (!response.ok) {
    const text = await response.text()
    console.error(`❌ Error SugarCRM: ${text}`)
    throw new Error(`SugarCRM: ${text}`)
  }

    return await response.json()
  }

}
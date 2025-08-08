
// lib/apiService.ts
import { invalidateToken, getToken } from './token'
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

  private async retryWithNewToken<T, B = unknown>(method: 'GET' | 'POST', endpoint: string, body?: B): Promise<T> {
    await invalidateToken()
    const newToken = await getToken()
    this.token = newToken

    const headers = this.getHeaders()
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      method,
      headers,
      ...(method === 'POST' ? { body: JSON.stringify(body) } : {}),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Error tras reintento: ${errorText}`)
      throw new Error(errorText)
    }

    return await response.json()
  }

  async get<T>(endpoint: string): Promise<T> {

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    })

    if (!response.ok) {
      if (response.status === 401 || response.status === 500) {
        return this.retryWithNewToken<T>('GET', endpoint)
      }
      const errorData = await response.json().catch(() => null)
      throw new Error(
        errorData?.error || `Error ${response.status}: ${response.statusText}`
      )
    }

    return await response.json()
  }


  async post<T, B = unknown>(endpoint: string, body: B): Promise<T> {

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    })

  if (!response.ok) {
      if (response.status === 401 || response.status === 500) {
        return this.retryWithNewToken<T>('POST', endpoint, body)
      }
    const text = await response.text()
    console.error(`❌ Error SugarCRM: ${text}`)
    throw new Error(`SugarCRM: ${text}`)
  }

    return await response.json()
  }

}
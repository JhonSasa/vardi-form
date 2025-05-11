// lib/apiService.ts
/*export class ApiService {
  private baseUrl: string
  private token: string

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl
    this.token = token
  }

  private getHeaders(extraHeaders?: Record<string, string>): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
      ...extraHeaders,
    }
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(
        errorData?.message || `Error ${response.status}: ${response.statusText}`
      )
    }

    return await response.json()
  }

  // Puedes extender con GET, PUT, DELETE, etc. según tus necesidades
}
*/

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
      headers.Authorization = `Bearer ${this.token}`
    }

    return headers
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(
        errorData?.error || `Error ${response.status}: ${response.statusText}`
      )
    }

    return await response.json()
  }
}
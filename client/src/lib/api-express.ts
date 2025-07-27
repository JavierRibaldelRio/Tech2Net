// lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface ApiFetchOptions {
    method?: Method
    body?: any
    token?: string
    headers?: Record<string, string>
}

export async function apiFetch<T = any>(
    endpoint: string,
    options: ApiFetchOptions = {}
): Promise<T> {
    const { method = 'GET', body, token, headers = {} } = options

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        body: body ? body : undefined,
    })

    if (!res.ok) {
        const errorText = await res.text()
        throw new Error(`Error ${res.status}: ${errorText}`)
    }

    return res.json()
}

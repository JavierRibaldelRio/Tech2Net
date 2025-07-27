// lib/api.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export function apiRoute(endpoint: string): string {

    return `${(API_BASE_URL || '').replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
}
'use client'

import { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { apiRoute } from '@/lib/api-express'

import { GalleryVerticalEnd } from 'lucide-react'
import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
    const router = useRouter()

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {


        const formData = new FormData(event.currentTarget);
        // Get data
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;


        try {
            const response = await fetch(apiRoute('/api/auth/login'), {

                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error("Error on login");
            }

            // const { token } = await response.json();
            // // stores 
            // localStorage.setItem('authToken', token);
        }
        catch (e) {

            console.error(e);
        }
    }

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    Net4Tech
                </a>
                <LoginForm handleSubmit={handleSubmit} />
            </div>
        </div>
    )
}
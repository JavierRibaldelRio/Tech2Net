'use client'

import { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { apiFetch } from '@/lib/api-express'

import { GalleryVerticalEnd } from 'lucide-react'
import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
    const router = useRouter()

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        console.log("lino")

        const formData = new FormData(event.currentTarget);
        console.log('fo :>> ', formData);
        const email = formData.get('email') as string;
        console.log('email :>> ', email);
        const password = formData.get('password') as string;


        //! apiFetch handles errors TODO
        const response = await apiFetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })

        const { token } = response;

        // stores 
        localStorage.setItem('authToken', token);

        router.push('/profile')
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
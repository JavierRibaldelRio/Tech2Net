'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { apiRoute } from '@/lib/api-express';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const response = await fetch(apiRoute('/api/auth/logout'), {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                router.push('/auth/login');
                router.refresh();
            }
        } catch (error) {
            console.error('Error while logging out:', error);
        }
    };

    return (
        <Button onClick={handleLogout}>
            Cerrar sesión
        </Button>
    );
}
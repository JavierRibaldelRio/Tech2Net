'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import User from '@/types/user.type';
import { apiRoute } from '@/lib/api-express';


export default function UserPage() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(apiRoute('/api/user/data'), {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Error while fetching the data');
                }

                const { createdAt, ...userData } = await response.json();
                setUser({ ...userData, createdAt: new Date(createdAt) });

            } catch (error) {
                console.error('Error:', error);
                router.push('/auth/login');
            }
        };

        fetchUser();
    }, [router]);

    if (user !== null) {
        return <ul className="user-details">
            <li><strong>Id:</strong> {user.id}</li>
            <li><strong>Username:</strong> {user.username}</li>
            <li><strong>Email:</strong> {user.email}</li>
            <li><strong>Name:</strong> {user.name}</li>
            <li><strong>Surnames:</strong> {user.surnames}</li>
            <li><strong>Created At:</strong> {user.createdAt.toLocaleDateString()}</li>
        </ul>

    }

    else {
        return <div>Null</div>
    }
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiRoute } from '@/lib/api-express';

// Interface of an event only to show it in this page as a list
interface LittleEvent {

    id: number,
    title: string
    eventStartTime: string
}


export default function EventsPage() {
    const router = useRouter();

    const [events, setEvents] = useState<LittleEvent[] | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(apiRoute('/api/events/get_events'), {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Error while fetching the data');
                }

                const data = await response.json();

                console.log(data);
                setEvents(data);



            } catch (error) {
                console.error('Error:', error);
                router.push('/auth/login');
            }
        };

        fetchUser();
    }, [router]);

    if (events !== null) {

        const eventsHTML = events.map(x => <li key={x.id}>{x.title}: ({new Date(x.eventStartTime).toLocaleDateString()})</li>);

        return <ul>
            {eventsHTML}
        </ul>
    }

    else {
        return <div>Null</div>
    }
}
"use client"


import { apiRoute } from "@/lib/api-express";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EventPage() {


    // Read from URL
    const { eventId } = useParams<{ eventId: string }>();


    //! Temporal
    const [eventData, setEventData] = useState<any>(null);


    useEffect(() => {

        const fetchEventData = async () => {


            const response = await fetch(apiRoute("/api/events/get_event/" + eventId), {

                credentials: "include"
            });

            if (!response.ok) {

                const { error, message } = await response.json();

                setEventData({ error, message });
            }

            else {

                setEventData(await response.json());
            }

        };

        fetchEventData();

    }, [setEventData]);


    if (eventData) {

        return <div>{JSON.stringify(eventData)}</div>;
    }

    else {

        return <div>Se está cargando</div>;
    }

}
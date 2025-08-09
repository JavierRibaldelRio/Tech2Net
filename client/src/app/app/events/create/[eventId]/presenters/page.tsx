"use client"

import { apiRoute } from "@/lib/api-express";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import Presenter from ":neth4tech/types/Presenter.type"
import { ModifyPresentersArea } from "./components.tsx/ModifyPresentersArea";


export default function ModifyPresentersPage() {

    // Read from URL
    const { eventId } = useParams<{ eventId: string }>();

    // State

    const [presenters, setPresenters] = useState<Presenter[] | string>("");

    useEffect(() => {

        const fetchParticipants = async () => {


            const response = await fetch(apiRoute('/api/events/get_users/' + eventId), {
                credentials: 'include'
            });

            if (!response.ok) {

                const { error, message } = await response.json();

                setPresenters(`ERR: ${message} (${error})`);

            }
            else {

                setPresenters(await response.json())

            }

        }

        fetchParticipants();

    }, [setPresenters]);

    // If error
    if (typeof presenters === "string") {

        return (


            <div>
                <p>{presenters}</p>
            </div>
        );
    }

    return (<div className="margin-[4px]" style={{ margin: "4vmax" }}>

        <ModifyPresentersArea pPresenters={presenters} /></div>
    )
}
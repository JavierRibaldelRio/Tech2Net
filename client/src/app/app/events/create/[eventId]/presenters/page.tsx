"use client"

import { apiRoute } from "@/lib/api-express";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PresentersDataToModify } from ":neth4tech/types/Presenter.type"
import { PresenterBasicData as Presenter } from ':neth4tech/schemas/presenter.schema';

import { ModifyPresentersArea } from "./components/ModifyPresentersArea";


export default function ModifyPresentersPage() {

    // Read from URL
    const { eventId } = useParams<{ eventId: string }>();

    // State

    const [presenters, setPresenters] = useState<Presenter[] | string>("");

    useEffect(() => {

        const fetchParticipants = async () => {
            const response = await fetch(apiRoute('/api/events/get_presenters/' + eventId), {
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

    const save = async (data: PresentersDataToModify) => {
        const response = await fetch(apiRoute('/api/events/modify_presenters/' + eventId), {
            method: 'POST',
            credentials: "include",

            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
        else {

            console.log('await response.json() :>> ', await response.json());
        }
    }
    // If error
    if (typeof presenters === "string") {

        return (


            <div>
                <p>{presenters}</p>
            </div>
        );
    }

    return (<div className="margin-[4px]" style={{ margin: "4vmax" }}>

        <ModifyPresentersArea
            pPresenters={presenters}
            save={save}
        /></div>
    )
}
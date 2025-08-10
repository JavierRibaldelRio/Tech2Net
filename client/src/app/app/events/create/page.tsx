'use client'

import { EventForm } from "@/components/forms/event-form/event-form"
import { EventFormData, } from ':neth4tech/schemas/event.schema'
import { STATUS } from ":neth4tech/constants/status"
import { parseEvent } from "@/utils/parseEvent"
import { apiRoute } from "@/lib/api-express"

export default function CreateEventPage() {

    async function handleSubmit(data: EventFormData) {

        // Parse data to format excepted at backend
        const dataParsed = parseEvent(data, STATUS.DRAFT);

        const response = await fetch(apiRoute("/api/events/create_event"),

            {
                method: "POST",
                credentials: "include",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataParsed),

            }

        )

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }
        else {
            // TODO
            console.log('await response.json() :>> ', await response.json());
        }



    }

    return <EventForm handleSubmit={handleSubmit} />
}
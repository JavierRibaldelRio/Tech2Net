'use client'

import { EventForm } from "@/components/forms/event-form/event-form"
import { EventFormSchema, EventFormData, } from ':neth4tech/schemas/event.schema'
import { STATUS } from ":neth4tech/constants/status"
import { parseEvent } from "@/utils/parseEvent"

export default function CreateEventPage() {

    function handleSubmit(data: EventFormData): void {

        // Parse data to format excepted at backend
        const dataParsed = parseEvent(data, STATUS.DRAFT);

        // TODO call API



    }

    return <EventForm handleSubmit={handleSubmit} />
}
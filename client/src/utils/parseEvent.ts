import { EventFormSchema, EventFormData, EventData, Status } from ':neth4tech/schemas/event.schema'
import { combineDateAndTime } from './dateFunctions';

/**
 * Parses the event form data into the format expected by the backend.
 *
 * @param {EventFormData} data - The data from the event form, including date and time fields.
 * @param {Status} status - The status to assign to the event.
 * @returns {EventData} The parsed event data, ready to be sent to the backend.
 */
export const parseEvent = (data: EventFormData, status: Status): EventData => {

    const {
        day,
        eventStartTime,
        eventEndTime,
        formOpenTime,
        formCloseTime,
        meetingsStartTime,
        meetingsEndTime,
        ...rest // resto de campos, excluyendo `day`
    } = data;


    return {
        ...rest,
        eventStartTime: combineDateAndTime(day, eventStartTime),
        eventEndTime: combineDateAndTime(day, eventEndTime),

        formOpenTime: formOpenTime ? combineDateAndTime(day, formOpenTime) : undefined,



        formCloseTime: formCloseTime ? combineDateAndTime(day, formCloseTime) : undefined,

        meetingsStartTime: combineDateAndTime(day, meetingsStartTime),
        meetingsEndTime: combineDateAndTime(day, meetingsEndTime),

        status: status
    };
}
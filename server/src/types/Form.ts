
// Type for form data for cache


export enum FormStatus {
    PRECHARGED = "PRECHARGED",
    IN_PROGRESS = "IN_PROGRESS",
    CLOSED = "CLOSED"
}

type PresenterAtFormDataCache = {
    name: string;
    organization: string;
    id: number;
}

export type FormDataCache = {


    status: FormStatus;

    data: {

        formOpenTime: Date;
        formCloseTime: Date;

        title: string;
        description: string;
        organization: string;

        eventId: number;

        presenters: PresenterAtFormDataCache[];

    }
}
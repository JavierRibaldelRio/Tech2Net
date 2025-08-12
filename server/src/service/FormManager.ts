import { FormDataCache, FormStatus } from "../types/Form";


const PRECHARGE_TIME = 36000000;
const CLEANUP_TIME = 36000000;
const REMOVAL_TIME = 1800000;



class FormManager {

    // Cache
    private cache: Map<string, FormDataCache> = new Map();

    // Timers (undefi)
    private precacheInterval: NodeJS.Timeout | undefined;
    private cleanupInterval: NodeJS.Timeout | undefined;

    // Status
    private newManager: boolean = true;

    constructor() {
        this.startBackgroundJobs();
    }



    // Private methods

    private startBackgroundJobs() {

        this.precacheInterval = setInterval(() => { this.prechargeForms() }, PRECHARGE_TIME);

        this.cleanupInterval = setInterval(() => { this.cleanUp() }, CLEANUP_TIME);
    }

    private async prechargeForms() {

    }

    private cleanUp() {
        const now = new Date();
        this.cache.forEach((entry, eventId) => {
            if (entry.status === FormStatus.CLOSED && entry.data.formCloseTime < new Date(now.getTime() - REMOVAL_TIME)) {
                this.cache.delete(eventId);
            }
        });
    }



}
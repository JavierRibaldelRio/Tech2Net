import * as z from "zod";

import parseTimeToMinutes from "../utils/parseTime";
import { STATUS } from "../constants/status";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;


// Status
const StatusEnum = z.enum(Object.values(STATUS));
export type Status = z.infer<typeof StatusEnum>;

// Events
const EventBasic = z.object({

    title: z.string().min(2).max(255),
    description: z.string().min(1),
    organization: z.string().max(100),
    url: z.url().max(255).optional().or(z.literal('')),
    location: z.string().max(255).optional(),
    numberOfSlotsForMeetings: z.number(),
    meetingsDuration: z.number(),

    maxNumberOfMeetingsPerPresenters: z.number(),
    maxTotalNumberOfMeetings: z.number(),

    automatic: z.boolean()

});


// Used on frontend to validate the form submition
export const EventFormSchema = EventBasic.extend({

    day: z.date(),
    eventStartTime: z.string().regex(timeRegex, "Invalid time format (expected HH:mm)"),
    eventEndTime: z.string().regex(timeRegex, "Invalid time format (expected HH:mm)"),

    formOpenTime: z.string().optional(),
    formCloseTime: z.string().optional(),

    meetingsStartTime: z.string().regex(timeRegex, "Invalid time format (expected HH:mm)"),
    meetingsEndTime: z.string().regex(timeRegex, "Invalid time format (expected HH:mm)"),
})
    .superRefine((data, ctx) => {

        if (data.automatic) {
            if (!timeRegex.test(data.formOpenTime ?? "")) {
                ctx.addIssue({
                    path: ["formOpenTime"],
                    code: "custom",
                    message: "Invalid time format (expected HH:mm)",
                });
            }

            if (!timeRegex.test(data.formCloseTime ?? "")) {
                ctx.addIssue({
                    path: ["formCloseTime"],
                    code: "custom",
                    message: "Invalid time format (expected HH:mm)",
                });
            }
        }
    })
    .superRefine((data, ctx) => {
        const start = parseTimeToMinutes(data.eventStartTime);
        const end = parseTimeToMinutes(data.eventEndTime);
        const open = parseTimeToMinutes(data.formOpenTime ?? "");
        const close = parseTimeToMinutes(data.formCloseTime ?? "");
        const meetingsStart = parseTimeToMinutes(data.meetingsStartTime);
        const meetingsEnd = parseTimeToMinutes(data.meetingsEndTime);

        if (data.automatic) {
            // --- AUTOMATIC = TRUE validations ---

            // 1. formOpenTime must be before formCloseTime
            if (open !== null && close !== null && open >= close) {
                ctx.addIssue({
                    path: ["formOpenTime"],
                    message: "Form opening time must be before closing time",
                    code: "custom",
                });
            }

            // 2. formCloseTime must be after eventStartTime
            if (start !== null && close !== null && start >= close) {
                ctx.addIssue({
                    path: ["formCloseTime"],
                    message: "Form closing time must be after event start time",
                    code: "custom",
                });
            }

            // 3. At least 10 minutes between formCloseTime and meetingsStartTime
            if (close !== null && meetingsStart !== null && close + 10 > meetingsStart) {
                ctx.addIssue({
                    path: ["meetingsStartTime"],
                    message: "There must be at least 10 minutes between form closing and meeting start time",
                    code: "custom",
                });
            }
        }

        // --- Validations for BOTH automatic true/false ---

        // 4. eventStartTime must be before meetingsStartTime
        if (start !== null && meetingsStart !== null && start >= meetingsStart) {
            ctx.addIssue({
                path: ["meetingsStartTime"],
                message: "Meeting start time must be after event start time",
                code: "custom",
            });
        }

        // 5. meetingsStartTime must be before meetingsEndTime
        if (meetingsStart !== null && meetingsEnd !== null && meetingsStart >= meetingsEnd) {
            ctx.addIssue({
                path: ["meetingsEndTime"],
                message: "Meeting end time must be after start time",
                code: "custom",
            });
        }

        // 6. meetingsEndTime must be on or before eventEndTime
        if (meetingsEnd !== null && end !== null && meetingsEnd > end) {
            ctx.addIssue({
                path: ["meetingsEndTime"],
                message: "Meeting end time must not exceed event end time",
                code: "custom",
            });
        }
    });


function zParseDate() {

    return z.preprocess(
        (val) =>
            typeof val === "string" || typeof val === "number"
                ? new Date(val)
                : val,
        z.date()
    );
}
export type EventFormData = z.infer<typeof EventFormSchema>;


// Used on back to check if the input is correct, and also in front to parse values before sending to front
export const EventBackendSchema = EventBasic.extend({

    eventStartTime: zParseDate(),


    eventEndTime: zParseDate(),

    formOpenTime: zParseDate().optional(),
    formCloseTime: zParseDate(),

    meetingsStartTime: zParseDate(),
    meetingsEndTime: zParseDate(),

    status: StatusEnum,

}).superRefine((data, ctx) => {
    const start = data.eventStartTime?.getTime() ?? null;
    const end = data.eventEndTime?.getTime() ?? null;
    const open = data.formOpenTime?.getTime() ?? null;
    const close = data.formCloseTime?.getTime() ?? null;
    const meetingsStart = data.meetingsStartTime?.getTime() ?? null;
    const meetingsEnd = data.meetingsEndTime?.getTime() ?? null;

    if (data.automatic) {
        // 1. formOpenTime must be before formCloseTime
        if (open !== null && close !== null && open >= close) {
            ctx.addIssue({
                path: ["formOpenTime"],
                message: "Form opening time must be before closing time",
                code: "custom",
            });
        }

        // 2. formCloseTime must be after eventStartTime
        if (start !== null && close !== null && start >= close) {
            ctx.addIssue({
                path: ["formCloseTime"],
                message: "Form closing time must be after event start time",
                code: "custom",
            });
        }

        // 3. At least 10 minutes between formCloseTime and meetingsStartTime
        if (close !== null && meetingsStart !== null && close + 10 * 60 * 1000 > meetingsStart) {
            ctx.addIssue({
                path: ["meetingsStartTime"],
                message: "There must be at least 10 minutes between form closing and meeting start time",
                code: "custom",
            });
        }
    }

    // 4. eventStartTime must be before meetingsStartTime
    if (start !== null && meetingsStart !== null && start >= meetingsStart) {
        ctx.addIssue({
            path: ["meetingsStartTime"],
            message: "Meeting start time must be after event start time",
            code: "custom",
        });
    }

    // 5. meetingsStartTime must be before meetingsEndTime
    if (meetingsStart !== null && meetingsEnd !== null && meetingsStart >= meetingsEnd) {
        ctx.addIssue({
            path: ["meetingsEndTime"],
            message: "Meeting end time must be after start time",
            code: "custom",
        });
    }

    // 6. meetingsEndTime must not exceed eventEndTime
    if (meetingsEnd !== null && end !== null && meetingsEnd > end) {
        ctx.addIssue({
            path: ["meetingsEndTime"],
            message: "Meeting end time must not exceed event end time",
            code: "custom",
        });
    }
});

export type EventData = z.infer<typeof EventBackendSchema>;
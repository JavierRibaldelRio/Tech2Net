import * as z from "zod";

const PresenterBasicSchema = z.object({

    name: z.string().min(2).max(100),
    email: z.email().max(100),
    organization: z.string().max(100),
    description: z.string()

});

export { PresenterBasicSchema }
export type PresenterBasicData = z.infer<typeof PresenterBasicSchema>;
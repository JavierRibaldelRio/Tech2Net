import * as z from "zod";

const presenterBasicSchema = z.object({

    name: z.string().max(100),
    email: z.email().max(100),
    organization: z.string().max(100),
    description: z.string()

});

export { presenterBasicSchema }
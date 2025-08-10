import * as z from "zod";

const PresenterBasicSchema = z.object({
    id: z.number(),
    name: z.string().min(2).max(100),
    email: z.email().max(100),
    organization: z.string().max(100),
    description: z.string()

});
const PresentersDataToModifySchema = z.object({
    newPresenters: z.array(PresenterBasicSchema),
    editedPresenters: z.array(PresenterBasicSchema),
    removedPresenters: z.array(z.number()),
});

export { PresenterBasicSchema, PresentersDataToModifySchema }
export type PresenterBasicData = z.infer<typeof PresenterBasicSchema>;
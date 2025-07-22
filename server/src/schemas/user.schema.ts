import { email, z } from 'zod';


// Schema for user refistration
const userRegistrationSchema = z.object({

    username: z.string().min(4)
        .max(50).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),

    email: z.email(),
    name: z.string().min(1).max(100),
    surnames: z.string().min(1).max(255),

    // Password, check for requierements

    password: z.string()
        .min(8, {
            message: "Password must be at least 8 characters long"
        })
        .max(255, {
            message: "Password cannot exceed 255 characters"
        })
        .regex(/[A-Z]/, {
            message: "Must contain at least one uppercase letter (A-Z)"
        })
        .regex(/[a-z]/, {
            message: "Must contain at least one lowercase letter (a-z)"
        })
        .regex(/[0-9]/, {
            message: "Must contain at least one digit (0-9)"
        })
        .regex(/[^A-Za-z0-9]/, {
            message: "Must contain at least one special character (!@#$%^&*, etc.)"
        })
        .refine(password => !password.includes(' '), {
            message: "Password cannot contain spaces"
        })

});


export { userRegistrationSchema };
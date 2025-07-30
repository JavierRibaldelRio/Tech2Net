// src/types/safe.ts
import { User } from '@prisma/client';

// Tipo seguro sin password
export type SafeUser = Omit<User, 'password'>;
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const adapter = PrismaAdapter(prisma)

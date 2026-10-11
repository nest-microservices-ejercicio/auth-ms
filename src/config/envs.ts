import z from "zod";
import 'dotenv/config'

const envsSchema = z.object({
    PORT: z.coerce.number(),
    NATS_SERVERS: 
        z.string()
        .transform((value) => value.split(',').map((server) => server.trim()))
        .pipe(z.array(z.string().min(1)).min(1)),
    JWT_SECRET: z.string()
})

const result = envsSchema.safeParse(process.env)

if(!result.success) {
    throw new Error(
        `Config validation error: ${result.error.message}`,
    );
}

export const envs = {
    port: result.data.PORT,
    natsServers: result.data.NATS_SERVERS,
    jwtSecret: result.data.JWT_SECRET
}
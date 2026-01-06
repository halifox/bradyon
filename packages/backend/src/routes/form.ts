import {Hono} from 'hono'
import {Bindings} from '../types'
import {zValidator} from "@hono/zod-validator"
import {z} from "zod"

const schema = z.object({
    file: z
        .instanceof(File)
        .refine(f => f.size > 0, 'empty file')
        .refine(f => f.size < 10/*GB*/ * 1024/*MB*/ * 1024/*KB*/ * 1024/*B*/, 'file too large')
})

const app = new Hono<{ Bindings: Bindings }>()

app.post('/form', zValidator('form', schema), async (c) => {
    const {file} = c.req.valid('form')
    const key = crypto.randomUUID()
    await c.env.r2_buckets.put(key, file.stream(), {
        httpMetadata: {
            contentType: file.type,
        },
        customMetadata: {
            filename: file.name,
        }
    })
    const url = new URL(c.req.url)
    return c.json({url: `${url.protocol}//${url.host}/${key}`})
})


export default app

import {Hono} from 'hono'
import {Bindings} from '../types'
import {zValidator} from "@hono/zod-validator"
import {z} from "zod"

const schema = z.object({
    filename: z.string(),
    filetype: z.string().optional().default('application/octet-stream'),
})

const app = new Hono<{ Bindings: Bindings }>()

app.post('/streaming', zValidator('header', schema), async (c) => {
    const {filename, filetype} = c.req.valid('header')
    const key = crypto.randomUUID()
    const body = c.req.raw.body
    if (!body) {
        return c.json({error: 'Missing request body'}, 400)
    }
    await c.env.r2_buckets.put(key, body, {
        httpMetadata: {
            contentType: filetype,
        },
        customMetadata: {
            filename: filename,
        }
    })
    const url = new URL(c.req.url)
    return c.json({url: `${url.protocol}//${url.host}/${key}`,})
})


export default app

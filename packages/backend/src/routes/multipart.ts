import {Hono} from 'hono'
import {z} from 'zod'
import {zValidator} from '@hono/zod-validator'
import {Bindings} from "../types" // 导入库


const uploadInitSchema = z.object({
    filename: z.string(),
    filetype: z.string().optional().default('application/octet-stream'),
})

const uploadPartSchema = z.object({
    uploadId: z.string(),
    key: z.string(),
    partNumber: z.string().transform(val => parseInt(val, 10)).refine(val => !isNaN(val), {message: "partNumber must be a number"}),
})

const uploadCompleteSchema = z.object({
    uploadId: z.string(),
    key: z.string(),
    parts: z.array(z.object({
        etag: z.string(),
        partNumber: z.number(),
    })),
})

const app = new Hono<{ Bindings: Bindings }>()

app.post('/mpu-create', zValidator('json', uploadInitSchema), async (c) => {
    const {filename, filetype} = c.req.valid('json')
    const key = crypto.randomUUID()
    const upload = await c.env.r2_buckets.createMultipartUpload(key, {
        httpMetadata: {
            contentType: filetype,
        },
        customMetadata: {
            filename: filename,
        }
    })
    return c.json({
        uploadId: upload.uploadId,
        key: upload.key
    })
})


app.post('/mpu-uploadpart', zValidator('query', uploadPartSchema), async (c) => {
    const {uploadId, key, partNumber} = c.req.valid('query')
    const upload = c.env.r2_buckets.resumeMultipartUpload(key, uploadId)
    const body = c.req.raw.body
    if (!body) {
        return c.json({error: 'Missing request body'}, 400)
    }
    const part = await upload.uploadPart(partNumber, body)
    return c.json(part)
})


app.post('/mpu-complete', zValidator('json', uploadCompleteSchema), async (c) => {
    const {uploadId, key, parts} = c.req.valid('json')
    const upload = c.env.r2_buckets.resumeMultipartUpload(key, uploadId)
    await upload.complete(parts)
    const url = new URL(c.req.url)
    return c.json({url: `${url.protocol}//${url.host}/${key}`})
})

export default app
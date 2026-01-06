import {Hono} from 'hono'
import {cors} from 'hono/cors'
import {Bindings, MultipartUploadContext} from "../types"
import {z} from "zod"
import {zValidator} from "@hono/zod-validator"
import {parseTusMetadata} from "../TusMetadata"

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors({
    origin: '*',
    allowMethods: ['POST', 'PATCH', 'HEAD', 'OPTIONS'],
    allowHeaders: ['Tus-Resumable', 'Upload-Length', 'Upload-Metadata', 'Upload-Offset', 'Content-Type'],
    exposeHeaders: ['Location', 'Upload-Offset', 'Upload-Length', 'Tus-Resumable'],
}))

const uploadHeaderSchema = z.object({
    'upload-length': z.coerce.number().int().min(0),
    'upload-metadata': z.string(),
})

/**
 * 1. POST: 初始化上传 (tus-resumable creation)
 */
app.post('/', zValidator('header', uploadHeaderSchema), async (c) => {
    const {'upload-length': totalLength, 'upload-metadata': metadata} = c.req.valid('header')
    const {filename, filetype} = parseTusMetadata(metadata)
    const key = crypto.randomUUID()
    const upload = await c.env.r2_buckets.createMultipartUpload(key, {
        httpMetadata: {
            contentType: filetype || 'application/octet-stream',
        },
        customMetadata: {
            filename: filename || "",
        }
    })
    await c.env.TUS_STATE.put(key, JSON.stringify(<MultipartUploadContext>{
        uploadId: upload.uploadId,
        totalLength: totalLength,
        offset: 0,
        parts: []
    }), {expirationTtl: 86400}) // 24小时过期
    return c.body(null, 201, {
        'Location': `${c.req.url}/${key}`,
        'Tus-Resumable': '1.0.0',
        'Upload-Offset': '0',
    })
})

/**
 * 2. HEAD: 断点续传查询
 */
app.get('/:key', async (c) => {
    const key = c.req.param('key')
    const state = await c.env.TUS_STATE.get<MultipartUploadContext>(key, {type: "json"})
    if (!state) return c.notFound()
    return c.body(null, 200, {
        'Tus-Resumable': '1.0.0',
        'Upload-Offset': `${state.offset}`,
        'Upload-Length': `${state.totalLength}`,
    })
})

const patchHeaderSchema = z.object({
    'upload-offset': z.coerce.number().int().min(0),
    'content-length': z.coerce.number().int().min(0),
})

/**
 * 3. PATCH: 上传分片 (核心)
 */
app.patch('/:key', zValidator('header', patchHeaderSchema), async (c) => {
    const {'upload-offset': offset, 'content-length': length} = c.req.valid('header')
    const key = c.req.param('key')
    const state = await c.env.TUS_STATE.get<MultipartUploadContext>(key, {type: "json"})
    if (!state) return c.notFound()
    if (offset !== state.offset) {
        return c.text('Conflict: Offset mismatch', 409)
    }
    // 恢复上传实例
    const upload = c.env.r2_buckets.resumeMultipartUpload(key, state.uploadId)

    // 处理流式上传，避免内存溢出
    const partNumber = state.parts.length + 1
    const part = await upload.uploadPart(partNumber, c.req.raw.body!)
    state.offset += length
    state.parts.push(part)

    // 判断是否完成
    if (state.offset === state.totalLength) {
        await upload.complete(state.parts)
        await c.env.TUS_STATE.delete(key)
    } else {
        await c.env.TUS_STATE.put(key, JSON.stringify(state), {expirationTtl: 86400})
    }

    return c.body(null, 204, {
        'Tus-Resumable': '1.0.0',
        'Upload-Offset': `${state.offset}`,
    })
})

export default app
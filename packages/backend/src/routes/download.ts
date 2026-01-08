import {Hono} from 'hono'
import {Bindings} from "../types"

const app = new Hono<{ Bindings: Bindings }>()

app.get('/:key', async (c) => {
    const {key} = c.req.param()

    // Anti-hotlink: Prevent usage as media source for other websites
    const dest = c.req.header('sec-fetch-dest')
    const site = c.req.header('sec-fetch-site')
    if (site !== 'same-origin' && dest && ['image', 'video', 'audio', 'object', 'embed', 'iframe'].includes(dest)) {
        return c.text('Hotlinking denied', 403)
    }

    const range = c.req.header('range')
    const object = await c.env.r2_buckets.get(key, {
        range: c.req.raw.headers,
        onlyIf: c.req.raw.headers,
    })
    if (!object) {
        return c.notFound()
    }

    const filename = object.customMetadata?.filename || key
    const headers = new Headers()
    object.writeHttpMetadata(headers)

    // 有对象但没有 Body (304 Not Modified)
    // 这是因为 onlyIf 条件（如 If-None-Match）生效了
    if (!('body' in object) || !object.body) {
        return new Response(null, {
            status: 304,
            headers,
        })
    }

    headers.set(
        'Content-Disposition',
        `attachment; filename*=UTF-8''${encodeRFC5987ValueChars(filename)}`
    );
    return c.body(object.body, {status: range ? 206 : 200, headers: headers})
})

function encodeRFC5987ValueChars(str: string) {
    return encodeURIComponent(str)
        // 根据 RFC 5987，这些字符需要被额外转义或特殊处理
        .replace(/['()!*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
        .replace(/\*/g, '%2A')
        .replace(/[']/g, '%27');
}

export default app
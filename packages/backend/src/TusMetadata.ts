/**
 * Tus 协议元数据对象接口
 */
interface TusMetadata {
    [key: string]: string | undefined
}

/**
 * 解析 Cloudflare Workers 中的 Upload-Metadata Header
 * @param metadataStr Request Headers 中的 Upload-Metadata 字符串
 * @returns 包含键值对的对象
 */
export function parseTusMetadata(metadataStr: string | null): TusMetadata {
    const metadata: TusMetadata = {}

    if (!metadataStr) {
        return metadata
    }

    // 1. 按逗号分割各项
    const pairs = metadataStr.split(',')

    for (const pair of pairs) {
        // 2. 分割键和 Base64 值
        const [key, base64Value] = pair.trim().split(/\s+/)

        if (key && base64Value) {
            try {
                // 3. 执行解码逻辑
                // 在 CF Workers (V8) 环境中，atob 处理的是二进制字符串
                const binString = atob(base64Value)
                const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0))

                // 使用 TextDecoder 确保正确解析 UTF-8（如中文文件名）
                metadata[key] = new TextDecoder().decode(bytes)
            } catch (e) {
                console.error(`[TusMetadata Error] 无法解析键 "${key}":`, e)
            }
        }
    }

    return metadata
}
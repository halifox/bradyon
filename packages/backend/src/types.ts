export type Bindings = {
    r2_buckets: R2Bucket
    TUS_STATE: KVNamespace
}

/**
 * 分片上传任务的上下文状态
 */
export interface MultipartUploadContext {
    uploadId: string      // 上传任务的唯一标识
    totalLength: number   // 文件总大小（字节）
    offset: number        // 当前上传的偏移量
    parts: R2UploadedPart[]   // 已完成的分片列表
}
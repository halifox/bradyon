import axios from 'axios';

const service = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 请求拦截器（可选：例如注入 Token）
service.interceptors.request.use(
    (config) => {
        // const token = localStorage.getItem('token');
        // if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器（可选：统一处理错误码）
service.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('网络请求错误:', error);
        return Promise.reject(error);
    }
);

const MULTIPART_THRESHOLD = 100 * 1024 * 1024; // 100MB
const CHUNK_SIZE = 100 * 1024 * 1024; // 100MB

export const uploadFile = async (
    file: File,
    onProgress: (percent: number) => void
): Promise<{ url: string }> => {
    if (file.size > MULTIPART_THRESHOLD) {
        return uploadMultipart(file, onProgress);
    }
    return uploadSimple(file, onProgress);
};

const uploadSimple = async (file: File, onProgress: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await service.post(`/api/form`, formData, {
        onUploadProgress: (evt) => {
            if (evt.total) {
                const percent = Math.round((evt.loaded * 100) / evt.total);
                onProgress(percent);
            }
        }
    });
    return {url: response.data?.url || '#'};
};

const uploadMultipart = async (file: File, onProgress: (percent: number) => void) => {
    // 1. Create
    const {data: initData} = await service.post(`/api/mpu-create`, {
        filename: file.name,
        filetype: file.type || 'application/octet-stream'
    });
    console.log(initData);
    const {uploadId, key} = initData;

    // 2. Upload parts
    const parts: { etag: string; partNumber: number }[] = [];
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let uploadedBytes = 0;

    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const partNumber = i + 1;

        const chunkResponse = await service.post(`/api/mpu-uploadpart`, chunk, {
                params: {uploadId, key, partNumber},
                headers: {'Content-Type': 'application/octet-stream'},
                onUploadProgress: (evt) => {
                    const chunkLoaded = evt.loaded;
                    const currentTotal = uploadedBytes + chunkLoaded;
                    const percent = Math.round((currentTotal * 100) / file.size);
                    // Ensure we don't exceed 100% due to any rounding quirks before completion
                    onProgress(Math.min(100, percent));
                }
            }
        );

        parts.push({
            etag: chunkResponse.data.etag,
            partNumber: partNumber
        });

        uploadedBytes += chunk.size;
    }

    // 3. Complete
    const {data: completeData} = await service.post(`/api/mpu-complete`, {
        uploadId,
        key,
        parts
    });

    return {url: completeData.url};
};

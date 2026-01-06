import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { uploadFile } from '../utils/api';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UploadContextType {
    status: UploadStatus;
    file: File | null;
    progress: number;
    resultUrl: string | null;
    error: string | null;
    startUpload: (file: File) => Promise<void>;
    reset: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const UploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [resultUrl, setResultUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const reset = useCallback(() => {
        setStatus('idle');
        setFile(null);
        setProgress(0);
        setResultUrl(null);
        setError(null);
    }, []);

    const startUpload = useCallback(async (selectedFile: File) => {
        setFile(selectedFile);
        setStatus('uploading');
        setProgress(0);
        setError(null);

        try {
            const { url } = await uploadFile(selectedFile, (percent) => {
                // Visual smoothing: Cap at 99% until the promise actually resolves
                setProgress((prev) => Math.max(prev, Math.min(99, percent)));
            });

            // Upload complete logic
            setProgress(100);
            
            // Introduce a small delay to allow the "100%" / "Hyperspeed" animation to play
            // before switching the view to the result.
            setTimeout(() => {
                setResultUrl(url);
                setStatus('success');
            }, 800); 

        } catch (err: any) {
            console.error(err);
            setError("Connection Terminated"); // Keeping the cyber-punk theme text
            setStatus('error');
        }
    }, []);

    return (
        <UploadContext.Provider value={{ status, file, progress, resultUrl, error, startUpload, reset }}>
            {children}
        </UploadContext.Provider>
    );
};

export const useUpload = () => {
    const context = useContext(UploadContext);
    if (!context) {
        throw new Error('useUpload must be used within an UploadProvider');
    }
    return context;
};

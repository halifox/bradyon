import React from 'react';
import {motion} from 'framer-motion';
import {AlertTriangle, Zap} from 'lucide-react';
import { useUpload } from '../context/UploadContext';

export const ProcessingStage: React.FC = () => {
    const { file, progress, error } = useUpload();
    
    // Derived state for visuals
    const isHyperSpeed = progress === 100;

    // Helper for formatting bytes
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const uploadedSize = file ? (file.size * progress / 100) : 0;
    const totalSize = file ? file.size : 0;

    return (
        <motion.div
            className="w-full h-full flex items-center justify-center relative overflow-hidden bg-space-black"
            // ENTRY
            initial={{opacity: 0, scale: 1.1, filter: "blur(15px) brightness(2)"}}
            animate={{opacity: 1, scale: 1, filter: "blur(0px) brightness(1)"}}
            // EXIT
            exit={{opacity: 0, transition: {duration: 0.5}}}
            transition={{duration: 1.0, ease: "easeOut"}}
        >

            <motion.div
                className="glass-panel rounded-2xl p-8 md:p-12 max-w-2xl w-full mx-4 relative z-10 flex flex-col items-center gap-8 shadow-2xl shadow-neon-cyan/5 overflow-hidden"
                initial={{y: 50, opacity: 0}}
                animate={isHyperSpeed ? {
                    scale: 0.9,
                    filter: "blur(15px) brightness(3)",
                    opacity: 0,
                    y: -50
                } : {
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    filter: "blur(0px) brightness(1)"
                }}
                transition={{duration: 0.8, ease: "easeInOut"}}
            >
                <div
                    className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 opacity-20 pointer-events-none bg-[length:100%_4px,3px_100%]"/>

                <div className="space-y-2 text-center relative z-10">
                    <motion.div className="flex items-center justify-center gap-2">
                        {error ? <AlertTriangle className="w-4 h-4 text-red-500"/> : <Zap className="w-4 h-4 text-neon-cyan"/>}
                        <h2 className={`text-sm font-mono uppercase tracking-[0.2em] ${error ? 'text-red-400' : 'text-gray-400'}`}>
                            {error ? 'MATTER TRANSPORT FAILED' : (isHyperSpeed ? 'BYPASSING RELATIVISTIC LIMITS' : 'STABILIZING MASS STREAM')}
                        </h2>
                        {!error && <Zap className="w-4 h-4 text-neon-magenta"/>}
                    </motion.div>
                </div>

                <div className="flex flex-col items-center justify-center w-full py-8 relative z-10">
                    <h1 className={`text-7xl font-bold font-mono tracking-tighter text-transparent bg-clip-text mb-2 ${error ? 'bg-gradient-to-b from-red-500 to-red-900' : 'bg-gradient-to-b from-white to-gray-400'}`}
                        style={{textShadow: error ? "0 0 30px rgba(255,0,0,0.2)" : "0 0 30px rgba(0,243,255,0.2)"}}>
                        {error ? 'ERR' : progress}<span className="text-3xl text-gray-600">%</span>
                    </h1>

                    {!error && (
                        <div className="w-full max-w-xs h-2 bg-gray-900/50 rounded-full flex gap-1 p-[2px] border border-white/5 mt-6">
                            {Array.from({length: 20}).map((_, i) => {
                                const isActive = (i / 20) * 100 < progress;
                                return (
                                    <motion.div
                                        key={i}
                                        className={`h-full flex-1 rounded-[1px] ${isActive ? 'bg-neon-cyan' : 'bg-white/5'}`}
                                        initial={false}
                                        animate={{
                                            opacity: isActive ? 1 : 0.3,
                                            backgroundColor: isActive ? '#00f3ff' : 'rgba(255,255,255,0.05)',
                                            boxShadow: isActive ? "0 0 8px #00f3ff" : "none"
                                        }}
                                    />
                                );
                            })}
                        </div>
                    )}

                    <p className={`mt-4 text-[10px] font-mono tracking-[0.2em] uppercase ${error ? 'text-red-500' : 'text-neon-cyan/60'}`}>
                        {error ? '>> QUANTUM DECOHERENCE DETECTED <<' : (isHyperSpeed ? '>> WARP DRIVE ENGAGED <<' : `>> MASS TRANSFER: ${formatBytes(uploadedSize)} / ${formatBytes(totalSize)} <<`)}
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};
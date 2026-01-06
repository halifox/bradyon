import React, {useRef, useState} from 'react';
import {motion, useAnimation} from 'framer-motion';
import {Sparkles, Upload} from 'lucide-react';
import clsx from 'clsx';
import { useUpload } from '../context/UploadContext';

export const UploadStage: React.FC = () => {
    const { startUpload } = useUpload();
    const [isDragging, setIsDragging] = useState(false);
    const controls = useAnimation();
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            await startUploadAnimation(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            await startUploadAnimation(file);
        }
    }

    const startUploadAnimation = async (file: File) => {
        // 1. Absorb/Select feedback
        await controls.start("absorb");
        // 2. Trigger upload via context
        startUpload(file);
    }

    return (
        <motion.div
            className="w-full h-full flex items-center justify-center relative overflow-hidden bg-space-black"
            // EXIT ANIMATION: "Overexposure" style
            exit={{
                opacity: 0,
                scale: 0.95,
                filter: "blur(15px) brightness(3)",
                transition: {duration: 0.5, ease: "easeInOut"}
            }}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                style={{display: 'none'}}
            />

            {/* Glass Card Container */}
            <motion.div
                className="glass-panel rounded-2xl p-8 md:p-12 max-w-2xl w-full mx-4 relative z-10 flex flex-col items-center gap-8 shadow-2xl shadow-neon-cyan/5 overflow-hidden"
                initial={{y: 20, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                transition={{duration: 0.6}}
            >
                <div
                    className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 opacity-20 pointer-events-none bg-[length:100%_4px,3px_100%]"/>

                <div className="space-y-2 text-center relative z-10">
                    <motion.div className="flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-neon-cyan"/>
                        <h2 className="text-sm font-mono text-gray-400 uppercase tracking-[0.2em]">INITIATE MATTER TRANSPORT</h2>
                        <Sparkles className="w-4 h-4 text-neon-magenta"/>
                    </motion.div>
                </div>

                {/* Drop Zone */}
                <motion.div
                    ref={containerRef}
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={clsx(
                        "relative z-10 w-full h-64 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300",
                        isDragging
                            ? "border-neon-cyan bg-neon-cyan/5 shadow-[0_0_30px_rgba(0,243,255,0.1)]"
                            : "border-white/10 hover:border-white/30 hover:bg-white/5"
                    )}
                    animate={controls}
                    variants={{
                        absorb: {
                            scale: 0.98,
                            borderColor: "#00f3ff",
                            backgroundColor: "rgba(0, 243, 255, 0.05)",
                            transition: {duration: 0.1}
                        }
                    }}
                >
                    <motion.div
                        className="absolute w-32 h-32 rounded-full border border-neon-cyan/30"
                        animate={{scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2]}}
                        transition={{duration: 3, repeat: Infinity, ease: "easeInOut"}}
                    />

                    <Upload className={clsx("w-10 h-10 mb-4 transition-colors", isDragging ? 'text-neon-cyan' : 'text-gray-400')}/>
                    <div className="text-center space-y-1">
                        <p className="text-sm font-mono text-gray-300 font-bold tracking-wide">
                            {isDragging ? 'RELEASE TO MATERIALIZE' : 'DROP MASS HERE'}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                            IMAGES • VIDEOS • BINARIES • CONFIGS
                        </p>
                    </div>
                </motion.div>

                <div className="text-center relative z-10">
                    <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                        SUBLUMINAL DIRECT LINK • NO LANDING PAGES
                    </p>
                </div>

            </motion.div>
        </motion.div>
    );
};

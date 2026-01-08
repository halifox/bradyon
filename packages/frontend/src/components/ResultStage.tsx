import React, {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {Check, Copy, RotateCcw, Sparkles} from 'lucide-react';
import clsx from 'clsx';
import { useUpload } from '../context/UploadContext';

export const ResultStage: React.FC = () => {
    const { resultUrl, reset } = useUpload();
    const url = resultUrl || "";
    
    const [displayedText, setDisplayedText] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let currentText = "";
        let index = 0;

        // Slight delay to allow the "landing" animation to settle
        const startDelay = setTimeout(() => {
            const interval = setInterval(() => {
                if (index < url.length) {
                    currentText += url[index];
                    setDisplayedText(currentText);
                    index++;
                } else {
                    clearInterval(interval);
                }
            }, 40);
            return () => clearInterval(interval);
        }, 500);

        return () => clearTimeout(startDelay);
    }, [url]);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            className="w-full h-full flex items-center justify-center relative overflow-hidden bg-space-black"
            // ENTRY: Smooth transition from the "Overexposed" exit of ProcessingStage
            initial={{opacity: 0, scale: 1.1, filter: "blur(15px) brightness(2)"}}
            animate={{opacity: 1, scale: 1, filter: "blur(0px) brightness(1)"}}
            // EXIT: Power Down
            exit={{opacity: 0, scale: 0.95, filter: "blur(5px)", transition: {duration: 0.4}}}
            transition={{duration: 1.0, ease: "easeOut"}}
        >
            {/* Background Shockwave Ring on Entry */}
            <motion.div
                className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
            >
                <motion.div
                    className="w-[100vw] h-[100vw] rounded-full border border-white/20"
                    initial={{scale: 0.5, opacity: 0, borderWidth: "0px"}}
                    animate={{scale: 1.2, opacity: [0, 0.5, 0], borderWidth: "2px"}}
                    transition={{duration: 1.5, ease: "easeOut"}}
                />
            </motion.div>

            {copied && (
                <motion.div
                    className="absolute inset-0 pointer-events-none z-0"
                    initial={{opacity: 0}}
                    animate={{opacity: [0, 0.8, 0]}}
                    transition={{duration: 1.5}}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/30 via-purple-500/30 to-neon-magenta/30 blur-[100px]"/>
                </motion.div>
            )}

            {/* Glass Card */}
            <motion.div
                className="glass-panel rounded-2xl p-8 md:p-12 max-w-2xl w-full mx-4 relative z-10 flex flex-col items-center gap-8 shadow-2xl shadow-neon-cyan/10 overflow-hidden"
                initial={{y: 20}}
                animate={{y: 0}}
                transition={{delay: 0.1, duration: 0.5}}
            >
                <div
                    className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 opacity-20 pointer-events-none bg-[length:100%_4px,3px_100%]"/>

                <div className="space-y-2 text-center relative z-10">
                    <motion.div
                        initial={{opacity: 0, y: -20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.3}}
                        className="flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-4 h-4 text-neon-cyan"/>
                        <h2 className="text-sm font-mono text-gray-400 uppercase tracking-[0.2em]">DIRECT LINK ESTABLISHED</h2>
                        <Sparkles className="w-4 h-4 text-neon-magenta"/>
                    </motion.div>
                </div>

                <div className="relative group w-full bg-black/60 rounded-lg p-6 border border-white/10 overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50"/>

                    <p className={clsx(
                        "font-mono text-lg md:text-2xl text-center break-all relative z-10",
                        "text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400"
                    )}
                       style={{
                           textShadow: "0px 0px 8px rgba(0, 243, 255, 0.5)"
                       }}
                    >
                        {displayedText}
                        <motion.span
                            animate={{opacity: [0, 1, 0]}}
                            transition={{repeat: Infinity, duration: 0.8}}
                            className="inline-block w-3 h-6 bg-neon-cyan align-middle ml-1 shadow-[0_0_10px_#00f3ff]"
                        />
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full justify-center relative z-10">
                    <button
                        onClick={handleCopy}
                        className="group relative px-8 py-4 rounded-lg bg-white/5 border border-white/10 overflow-hidden transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out"/>

                        {copied ? <Check className="w-5 h-5 text-green-400 relative z-10"/> : <Copy className="w-5 h-5 text-neon-cyan relative z-10"/>}
                        <span className="text-sm font-bold tracking-wide relative z-10 text-white">{copied ? 'COPIED' : 'COPY COORDINATES'}</span>

                        <div className="absolute inset-0 rounded-lg ring-1 ring-white/20 group-hover:ring-neon-cyan/50 transition-all duration-300"/>
                    </button>

                    <button
                        onClick={reset}
                        className="px-8 py-4 rounded-lg bg-transparent border border-white/10 hover:border-white/30 text-gray-400 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 w-full sm:w-auto"
                    >
                        <RotateCcw className="w-5 h-5"/>
                        <span className="text-sm font-bold tracking-wide">NEW TRANSMISSION</span>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};
import { AnimatePresence, motion } from 'framer-motion';
import { UploadStage } from './components/UploadStage';
import { ProcessingStage } from './components/ProcessingStage';
import { ResultStage } from './components/ResultStage';
import { UploadProvider, useUpload } from './context/UploadContext';

function AppContent() {
  const { status } = useUpload();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-space-black text-white selection:bg-neon-cyan/30 font-sans">
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="upload"
            className="w-full h-full"
            exit={{ opacity: 0 }} 
          >
            <UploadStage />
          </motion.div>
        )}

        {(status === 'uploading' || status === 'error') && (
          <motion.div
            key="process"
            className="w-full h-full"
          >
            <ProcessingStage />
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            key="result"
            className="w-full h-full"
          >
            <ResultStage />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Footer / Branding */}
      <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none opacity-20 z-50">
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase">BRADYON SUBLUMINAL TRANSPORT v1.0</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <UploadProvider>
      <AppContent />
    </UploadProvider>
  );
}

import React, { useRef, useState, DragEvent, useCallback, useEffect } from 'react';

type InputMode = 'upload' | 'text' | 'camera' | 'fridge';

// --- ICONS ---
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);
const TextIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const CameraIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const FridgeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>);

interface ImageUploaderProps {
  onGenerate: () => void;
  isGenerating: boolean;
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  textValue: string;
  onTextChange: (value: string) => void;
  fridgeValue: string;
  onFridgeChange: (value: string) => void;
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  isSubmittable: boolean;
}

const TabButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center p-3 text-sm font-medium border-b-2 transition-all duration-300
                ${isActive ? 'border-orange-500 text-orange-400' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
  >
    {icon}
    <span className="mt-1">{label}</span>
  </button>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onGenerate, isGenerating, imagePreview, onImageChange, textValue, onTextChange,
  fridgeValue, onFridgeChange, inputMode, setInputMode, isSubmittable
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = async () => {
    stopCamera();
    onImageChange(null);
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setCameraError("Could not access camera. Please check permissions.");
    }
  };
  
  useEffect(() => {
    if (inputMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    // Cleanup on component unmount
    return () => stopCamera();
  }, [inputMode]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      canvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onImageChange(file);
        }
      }, 'image/jpeg');
      stopCamera();
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageChange(e.dataTransfer.files[0]);
    }
  };

  const renderInputContent = () => {
    switch (inputMode) {
      case 'text':
        return (
          <div className="p-4">
            <input 
              type="text"
              value={textValue}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="e.g., 'Mushroom Risotto'"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
            />
          </div>
        );
      case 'fridge':
        return (
          <div className="p-4">
            <textarea
              value={fridgeValue}
              onChange={(e) => onFridgeChange(e.target.value)}
              placeholder="What's in your fridge? (e.g., chicken, tomatoes, rice, onion)"
              rows={4}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow resize-none"
            />
          </div>
        );
      case 'camera':
        return (
          <div className="relative w-full h-64 bg-black rounded-lg flex items-center justify-center overflow-hidden">
            {cameraError ? <p className="text-red-400 text-center px-4">{cameraError}</p> : null}
            <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${!stream || imagePreview ? 'hidden' : ''}`}></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            {imagePreview && (
                <div className="w-full h-full relative group">
                    <img src={imagePreview} alt="Captured preview" className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={startCamera} className="px-4 py-2 bg-white/20 text-white rounded-lg">Retake</button>
                    </div>
                </div>
            )}
            {stream && !imagePreview && (
              <button onClick={handleCapture} className="absolute bottom-4 px-6 py-2 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 transition-colors">
                Capture Photo
              </button>
            )}
          </div>
        );
      case 'upload':
      default:
        return (
          <div
            className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer ${imagePreview ? 'border-orange-500' : 'border-gray-600 hover:border-orange-500'} ${isDragging ? 'border-orange-400 bg-gray-700/50' : ''} transition-all duration-300 ease-in-out group`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          >
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onImageChange(e.target.files?.[0] || null)} />
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Dish preview" className="object-cover w-full h-full rounded-md" />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                  <p className="text-white text-lg font-semibold">Click or drop to replace</p>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400 group-hover:text-orange-400 transition-colors pointer-events-none">
                <UploadIcon />
                {isDragging ? <p className="mt-2 font-semibold">Drop your image here!</p> : <><p className="mt-2">Click or drag & drop an image</p><p className="text-xs">PNG, JPG, WEBP</p></>}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="w-full bg-gray-800 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden">
      <div className="flex bg-gray-800/50">
        <TabButton label="Upload" icon={<UploadIcon />} isActive={inputMode === 'upload'} onClick={() => setInputMode('upload')} />
        <TabButton label="Text" icon={<TextIcon />} isActive={inputMode === 'text'} onClick={() => setInputMode('text')} />
        <TabButton label="Capture" icon={<CameraIcon />} isActive={inputMode === 'camera'} onClick={() => setInputMode('camera')} />
        <TabButton label="My Fridge" icon={<FridgeIcon />} isActive={inputMode === 'fridge'} onClick={() => setInputMode('fridge')} />
      </div>
      
      <div className="p-4">
        {renderInputContent()}
      </div>

      <div className="p-4 pt-0 flex justify-center">
        <button
          onClick={onGenerate}
          disabled={!isSubmittable || isGenerating}
          className="flex items-center justify-center w-full md:w-auto px-8 py-3 text-lg font-semibold text-white bg-orange-600 rounded-lg shadow-lg hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
        >
          {isGenerating ? 'Generating...' : 'Generate Recipe'}
        </button>
      </div>
    </div>
  );
};

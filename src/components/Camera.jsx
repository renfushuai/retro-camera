import React, { useRef, useState, useEffect } from 'react';
import Photo from './Photo';
import { generateId } from '../utils/id';
import { generateCaption } from '../utils/gemini';

const Camera = ({ onPhotoEjected, onCapture, apiKey, onCaptionGenerated, isMobile = false }) => {
    const videoRef = useRef(null);
    const [ejectingPhoto, setEjectingPhoto] = useState(null);
    const [flash, setFlash] = useState(false);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);

    const startCamera = async () => {
        try {
            setError(null);
            const s = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: isMobile ? "environment" : "user", // Rear camera on mobile
                    width: isMobile ? { ideal: 1920 } : 450,
                    height: isMobile ? { ideal: 1080 } : 450
                }
            });
            setStream(s);
            if (videoRef.current) {
                videoRef.current.srcObject = s;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Camera access denied. Please allow camera access.");
        }
    };

    useEffect(() => {
        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isMobile]);

    const takePhoto = async () => {
        console.log("Shutter clicked!");

        if (!stream) {
            console.warn("No camera stream");
            // Try to start camera if not active
            startCamera();
            return;
        }

        if (!videoRef.current) {
            console.error("No video ref!");
            return;
        }

        if (ejectingPhoto) {
            console.log("Already ejecting a photo.");
            return;
        }

        console.log("Taking photo...");
        // Flash effect
        setFlash(true);
        setTimeout(() => setFlash(false), 100);

        // Capture
        const canvas = document.createElement('canvas');
        const video = videoRef.current;

        // Removed strict readyState check as it might prevent capture on some devices
        // if (video.readyState !== 4) ...

        const aspect = 3 / 4;
        const videoH = video.videoHeight || 450; // Fallback
        const videoW = video.videoWidth || 450;

        let cropW, cropH;
        if (videoW / videoH > aspect) {
            cropH = videoH;
            cropW = videoH * aspect;
        } else {
            cropW = videoW;
            cropH = videoW / aspect;
        }

        const startX = (videoW - cropW) / 2;
        const startY = (videoH - cropH) / 2;

        canvas.width = 600;
        canvas.height = 800;

        const ctx = canvas.getContext('2d');
        // Flip horizontally
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);

        try {
            ctx.drawImage(video, startX, startY, cropW, cropH, 0, 0, canvas.width, canvas.height);
        } catch (e) {
            console.error("Error drawing video to canvas:", e);
            return;
        }

        const imageSrc = canvas.toDataURL('image/jpeg', 0.9);
        const photoId = generateId();

        const newPhoto = {
            id: photoId,
            src: imageSrc,
            date: new Date().toLocaleDateString(),
            caption: "Developing...",
        };

        setEjectingPhoto(newPhoto);
        onCapture(newPhoto); // Notify App (optional, maybe just for tracking)

        // Generate Caption
        try {
            const caption = await generateCaption(imageSrc, apiKey);

            // Update local state if still ejecting
            setEjectingPhoto(prev => {
                if (prev && prev.id === photoId) {
                    return { ...prev, caption };
                }
                return prev;
            });

            // Notify App to update global state (if on wall)
            if (onCaptionGenerated) {
                onCaptionGenerated(photoId, caption);
            }
        } catch (e) {
            console.error("Caption generation failed", e);
        }
    };

    const cameraSize = isMobile ? 'w-[90vw] max-w-[500px] h-[90vw] max-w-[500px]' : 'w-[450px] h-[450px]';
    const cameraPosition = isMobile ? 'bottom-4 left-1/2 -translate-x-1/2' : 'bottom-16 left-16';

    return (
        <div className={`fixed ${cameraPosition} ${cameraSize} z-20 select-none`}>
            {/* Flash Overlay */}
            {flash && <div className="fixed inset-0 bg-white z-50 opacity-50 pointer-events-none" />}

            {/* Ejection Slot Container */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[35%] h-full z-10 pointer-events-none">
                {ejectingPhoto && (
                    <div className="pointer-events-auto w-full relative">
                        <Photo
                            data={ejectingPhoto}
                            isEjecting={true}
                            onDragEnd={(data, info) => {
                                onPhotoEjected(data, info.point);
                                setEjectingPhoto(null);
                            }}
                            style={{ width: '100%' }}
                        />
                    </div>
                )}
            </div>

            {/* Camera Body Image */}
            <img
                src="https://s.baoyu.io/images/retro-camera.webp"
                alt="Retro Camera"
                className="absolute bottom-0 left-0 w-full h-full object-contain z-20 pointer-events-none"
            />

            {/* Viewfinder Video */}
            <div className="absolute bottom-[32%] left-[62%] -translate-x-1/2 w-[27%] h-[27%] rounded-full overflow-hidden z- bg-black border-4 border-gray-800">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                />

                {/* Camera Error/Permission Overlay */}
                {(!stream || error) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white text-center p-2 z-40">
                        {error ? (
                            <>
                                <p className="text-[10px] text-red-400 mb-1 leading-tight">{error}</p>
                                <button
                                    onClick={startCamera}
                                    className="text-[10px] underline hover:text-blue-300 pointer-events-auto"
                                >
                                    Retry
                                </button>
                            </>
                        ) : (
                            <p className="text-[10px]">Starting...</p>
                        )}
                    </div>
                )}
            </div>

            {/* Shutter Button */}
            <button
                className={`absolute bottom-[40%] left-[18%] ${isMobile ? 'w-[13%] h-[13%]' : 'w-[11%] h-[11%]'} cursor-pointer z-50 rounded-full hover:bg-white/20 active:bg-white/40 active:scale-95 transition-all border-2 border-white/20 hover:border-white/50 outline-none shadow-lg`}
                onClick={(e) => {
                    console.log("Button clicked");
                    takePhoto();
                }}
                title="Take Photo"
                aria-label="Take Photo"
            />
        </div>
    );
};

export default Camera;

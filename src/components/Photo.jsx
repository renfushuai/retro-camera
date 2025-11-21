import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, X, RefreshCw, Pencil } from 'lucide-react';
import html2canvas from 'html2canvas';
import clsx from 'clsx';

const Photo = ({
    data,
    isEjecting,
    onDragEnd,
    onDelete,
    onUpdateCaption,
    onRefreshCaption,
    style
}) => {
    const [isDeveloping, setIsDeveloping] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isTextHovered, setIsTextHovered] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedCaption, setEditedCaption] = useState(data.caption);
    const cardRef = useRef(null);

    useEffect(() => {
        // Start developing effect
        const timer = setTimeout(() => {
            setIsDeveloping(false);
        }, 5000); // 5 seconds to develop
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setEditedCaption(data.caption);
    }, [data.caption]);

    const handleDownload = async (e) => {
        e.stopPropagation();
        if (cardRef.current) {
            try {
                const canvas = await html2canvas(cardRef.current, {
                    backgroundColor: null,
                    scale: 2, // Higher quality
                    useCORS: true,
                });
                const link = document.createElement('a');
                link.download = `bao-retro-${data.id}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (err) {
                console.error("Download failed:", err);
            }
        }
    };

    const handleSaveEdit = () => {
        onUpdateCaption(data.id, editedCaption);
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSaveEdit();
        } else if (e.key === 'Escape') {
            setEditedCaption(data.caption);
            setIsEditing(false);
        }
    };

    return (
        <motion.div
            ref={cardRef}
            layoutId={isEjecting ? `photo-${data.id}` : undefined}
            drag
            dragMomentum={false}
            onDragEnd={(e, info) => onDragEnd && onDragEnd(data, info)}
            initial={isEjecting ? { y: 0 } : { opacity: 0, scale: 0.9 }}
            animate={isEjecting ? { y: "-50%" } : { opacity: 1, scale: 1 }}
            transition={{ duration: isEjecting ? 2 : 0.3, ease: "easeOut" }}
            className={clsx(
                "absolute bg-white shadow-xl p-3 flex flex-col items-center select-none",
                "cursor-grab active:cursor-grabbing",
                !style?.width && "w-[200px]"
            )}
            style={{
                aspectRatio: '3/4',
                ...style,
                zIndex: isEjecting ? 10 : 30,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Photo Area */}
            <div className="w-full aspect-[3/4] bg-gray-900 overflow-hidden relative mb-4">
                <img
                    src={data.src}
                    alt="Memory"
                    className={clsx(
                        "w-full h-full object-cover transition-all duration-[5000ms]",
                        isDeveloping ? "blur-md grayscale opacity-80" : "blur-0 grayscale-0 opacity-100"
                    )}
                />

                {/* Toolbar (Download/Delete) */}
                {!isEjecting && isHovered && (
                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                        <button
                            onClick={handleDownload}
                            className="p-1.5 bg-white/80 rounded-full hover:bg-white text-gray-800 transition-colors"
                            title="Download"
                        >
                            <Download size={16} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(data.id); }}
                            className="p-1.5 bg-white/80 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                            title="Delete"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Footer (Date & Caption) */}
            <div
                className="w-full flex-1 flex flex-col justify-between relative"
                onMouseEnter={() => setIsTextHovered(true)}
                onMouseLeave={() => setIsTextHovered(false)}
            >
                <div className="text-xs text-gray-400 font-handwritten text-right">
                    {data.date}
                </div>

                <div className="relative flex-1 flex items-center justify-center text-center">
                    {isEditing ? (
                        <input
                            autoFocus
                            type="text"
                            value={editedCaption}
                            onChange={(e) => setEditedCaption(e.target.value)}
                            onBlur={handleSaveEdit}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent border-b border-gray-300 focus:outline-none font-handwritten text-xl text-center text-gray-800"
                        />
                    ) : (
                        <p
                            className="font-handwritten text-xl text-gray-800 leading-tight px-2 cursor-pointer"
                            onDoubleClick={() => setIsEditing(true)}
                        >
                            {data.caption || "..."}
                        </p>
                    )}

                    {/* Text Controls */}
                    {!isEjecting && isTextHovered && !isEditing && (
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-1 text-gray-400 hover:text-blue-500"
                                title="Edit"
                            >
                                <Pencil size={14} />
                            </button>
                            <button
                                onClick={() => onRefreshCaption(data.id)}
                                className="p-1 text-gray-400 hover:text-green-500"
                                title="Regenerate Caption"
                            >
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Photo;

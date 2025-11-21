import React, { useState, useEffect } from 'react';
import Camera from './components/Camera';
import PhotoWall from './components/PhotoWall';
import { Settings } from 'lucide-react';
import { generateCaption } from './utils/gemini';

function App() {
  const [photos, setPhotos] = useState([]);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    localStorage.setItem('gemini_api_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePhotoEjected = (photo, dropPoint) => {
    // Center the photo on the drop point
    const width = 160;
    const height = width * (4 / 3);

    setPhotos(prev => [...prev, {
      ...photo,
      x: dropPoint.x - width / 2,
      y: dropPoint.y - height / 2,
    }]);
  };

  const handlePhotoMove = (id, x, y) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, x, y } : p));
  };

  const handleCaptionGenerated = (id, caption) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, caption } : p));
  };

  const handleUpdateCaption = (id, caption) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, caption } : p));
  };

  const handleDelete = (id) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleRefreshCaption = async (id) => {
    const photo = photos.find(p => p.id === id);
    if (!photo) return;

    handleUpdateCaption(id, "Regenerating...");

    try {
      const newCaption = await generateCaption(photo.src, apiKey);
      handleUpdateCaption(id, newCaption);
    } catch (e) {
      handleUpdateCaption(id, "Error regenerating.");
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#f4f1ea] relative">
      {/* Title */}
      {!isMobile && (
        <h1 className="absolute top-8 left-1/2 -translate-x-1/2 text-4xl font-handwritten text-gray-800 z-10 pointer-events-none select-none">
          Bao Retro Camera
        </h1>
      )}

      {/* Instructions */}
      {!isMobile && (
        <div className="absolute bottom-8 right-8 text-right font-handwritten text-gray-600 z-10 pointer-events-none select-none">
          <p>1. Click the shutter button to take a photo.</p>
          <p>2. Wait for the photo to eject.</p>
          <p>3. Drag the photo to the wall!</p>
          <p>4. Hover to edit caption or download.</p>
        </div>
      )}

      {/* Settings Button */}
      <button
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 z-50 active:scale-95 transition-transform"
        onClick={() => setShowSettings(!showSettings)}
        title="Settings"
      >
        <Settings size={24} />
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute top-14 right-4 bg-white p-4 shadow-xl rounded-lg z-50 w-64">
          <label className="block text-sm font-bold mb-2">Gemini API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full border p-2 rounded mb-2"
            placeholder="Enter API Key..."
          />
          <p className="text-xs text-gray-500">
            Required for AI captions.
          </p>
        </div>
      )}

      <PhotoWall
        photos={photos}
        onPhotoMove={handlePhotoMove}
        onUpdateCaption={handleUpdateCaption}
        onRefreshCaption={handleRefreshCaption}
        onDelete={handleDelete}
      />

      <Camera
        onPhotoEjected={handlePhotoEjected}
        onCapture={() => { }}
        apiKey={apiKey}
        onCaptionGenerated={handleCaptionGenerated}
        isMobile={isMobile}
      />
    </div>
  );
}

export default App;

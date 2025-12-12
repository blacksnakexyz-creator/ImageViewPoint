import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Landing } from './components/Landing';
import { SidebarLeft } from './components/SidebarLeft';
import { SidebarRight } from './components/SidebarRight';
import { Canvas } from './components/Canvas';
import { AppView, TransformationState, HistoryItem, PresetAngle } from './types';
import { generateNewView } from './services/geminiService';

const DEFAULT_TRANSFORM: TransformationState = {
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  zoom: 1,
  distortion: 0,
  lightingAngle: 45
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [transformation, setTransformation] = useState<TransformationState>(DEFAULT_TRANSFORM);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Handlers ---

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
      setProcessedImage(null); // Reset processed when new image loads
      setTransformation(DEFAULT_TRANSFORM);
      setView(AppView.EDITOR);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (preset: PresetAngle) => {
    // Update controls to reflect preset approximately for visual feedback
    let newTransform = { ...DEFAULT_TRANSFORM };
    switch (preset) {
      case PresetAngle.FRONT: break;
      case PresetAngle.LEFT: newTransform.rotateY = -45; break;
      case PresetAngle.RIGHT: newTransform.rotateY = 45; break;
      case PresetAngle.TOP: newTransform.rotateX = 45; break;
      case PresetAngle.BOTTOM: newTransform.rotateX = -45; break;
      case PresetAngle.BACK: newTransform.rotateY = 180; break;
    }
    setTransformation(newTransform);
    
    // Trigger Generation
    generateView(newTransform, preset);
  };

  const handleGenerate = () => {
    generateView(transformation);
  };

  const generateView = async (params: TransformationState, preset?: PresetAngle) => {
    if (!originalImage || isProcessing) return;

    setIsProcessing(true);
    try {
      const generatedImageBase64 = await generateNewView(originalImage, params, preset);
      
      setProcessedImage(generatedImageBase64);
      
      // Add to history
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        imageData: generatedImageBase64,
        thumbnail: generatedImageBase64, // In a real app, generate a small thumb
        description: preset ? `${preset} View` : `Custom: X:${params.rotateX}° Y:${params.rotateY}°`,
        timestamp: Date.now(),
        transformation: { ...params }
      };
      
      setHistory(prev => [...prev, newItem]);
    } catch (error) {
      alert("Failed to generate view. Please check your API Key and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setProcessedImage(item.imageData);
    setTransformation(item.transformation);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear the project history?")) {
      setHistory([]);
    }
  };

  const handleGoHome = () => {
    setView(AppView.LANDING);
    setOriginalImage(null);
    setProcessedImage(null);
    setHistory([]);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background text-white overflow-hidden">
      
      <Header onHomeClick={handleGoHome} currentView={view} />

      {view === AppView.LANDING ? (
        <Landing onImageUpload={handleImageUpload} />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Controls */}
          <SidebarLeft 
            currentTransform={transformation} 
            setTransform={setTransformation}
            onApplyPreset={handleApplyPreset}
            isProcessing={isProcessing}
            onGenerate={handleGenerate}
          />

          {/* Center: Canvas */}
          <Canvas 
            originalImage={originalImage}
            processedImage={processedImage}
            transformation={transformation}
            isProcessing={isProcessing}
          />

          {/* Right Sidebar: History & Export */}
          <SidebarRight 
            history={history}
            onSelectHistory={handleSelectHistory}
            onClearHistory={handleClearHistory}
            currentImage={processedImage || originalImage}
          />
        </div>
      )}
    </div>
  );
};

export default App;

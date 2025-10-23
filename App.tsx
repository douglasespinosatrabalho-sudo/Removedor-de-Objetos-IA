
import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import ImageEditor from './components/ImageEditor';
import { LogoIcon } from './components/Icons';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageUpload = (file: File) => {
    setImageFile(file);
  };

  const handleReset = () => {
    setImageFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 transition-all duration-500">
      <header className="w-full max-w-5xl text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
            <LogoIcon />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-tight">
             Removedor de Objetos IA
            </h1>
        </div>
        <p className="text-xl sm:text-2xl font-medium text-gray-700">Apague o que quiser com um simples traço.</p>
        <p className="text-sm text-gray-500 mt-1">Powered by Nanobanana AI.</p>
      </header>
      
      <main className="flex-grow w-full flex items-center justify-center my-8">
        <div className="w-full max-w-5xl transition-opacity duration-500">
          {imageFile ? (
            <ImageEditor file={imageFile} onReset={handleReset} />
          ) : (
            <ImageUpload onImageUpload={handleImageUpload} />
          )}
        </div>
      </main>

      <footer className="w-full max-w-5xl text-center text-xs text-gray-500 px-4">
        <p>Este site usa a tecnologia de inteligência artificial Nanobanana para preencher automaticamente as áreas selecionadas de forma realista.</p>
      </footer>
    </div>
  );
};

export default App;

import React, { useState, useEffect, useCallback } from 'react';
import { WORKS } from './worksCatalog';

const STATIC_WORKS = WORKS.map((w) => ({
  id: w.id,
  name: w.name,
  type: w.type,
  url: w.url,
}));

// --- IndexedDB Utility for Works Gallery ---
const DB_NAME = 'VisionaryGalleryDB';
const STORE_NAME = 'portfolioWorks';

const initGalleryDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveWorkToDB = async (file: File): Promise<any> => {
  const db = await initGalleryDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const item = {
      type: file.type.startsWith('video') ? 'video' : 'image',
      blob: file,
      name: file.name,
      timestamp: Date.now()
    };
    const request = store.add(item);
    request.onsuccess = () => resolve({ ...item, id: request.result });
    request.onerror = () => reject(request.error);
  });
};

const getWorksFromDB = async (): Promise<any[]> => {
  const db = await initGalleryDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deleteWorkFromDB = async (id: number): Promise<void> => {
  const db = await initGalleryDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const WorksGallery = () => {
  // Merge Static Works with Local Works (Static works first)
  const [localWorks, setLocalWorks] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  // Load from DB on mount
  useEffect(() => {
    const loadWorks = async () => {
      try {
        const works = await getWorksFromDB();
        const loaded = works.map(w => ({
          id: w.id,
          url: URL.createObjectURL(w.blob),
          name: w.name,
          type: w.type
        })).sort((a, b) => b.id - a.id); // Newest first
        setLocalWorks(loaded);
      } catch (e) {
        console.error("Failed to load works:", e);
      }
    };
    loadWorks();
  }, []);

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newWorks: any[] = [];
    for (const file of fileArray) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) continue;
      try {
        const saved = await saveWorkToDB(file);
        newWorks.push({ id: saved.id, url: URL.createObjectURL(file), name: saved.name, type: saved.type });
      } catch (e) { console.error("Error saving work:", e); }
    }
    setLocalWorks(prev => [...newWorks, ...prev]);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); if (e.currentTarget.contains(e.relatedTarget as Node)) return; setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files); }, []);

  const handleDelete = async (id: number) => {
    await deleteWorkFromDB(id);
    setLocalWorks(prev => prev.filter(p => p.id !== id));
  };

  // Combine static and local
  const displayWorks = [...STATIC_WORKS, ...localWorks];
  const bgVideos = STATIC_WORKS.filter(w => w.type === 'video' && typeof w.url === 'string' && w.url.length > 0).map(w => w.url);
  const bgVideo = bgVideos.length > 0 ? bgVideos[Math.min(bgIndex, bgVideos.length - 1)] : null;
  const advanceBg = useCallback(() => {
    if (bgVideos.length <= 1) return;
    setBgIndex((i) => (i + 1) % bgVideos.length);
  }, [bgVideos.length]);

  return (
    <section 
      id="works" 
      className={`py-32 px-6 relative z-10 transition-colors duration-300 ${isDragging ? 'bg-emerald-900/10' : 'bg-transparent'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {bgVideo ? (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <video
            key={bgVideo}
            src={bgVideo}
            autoPlay
            muted
            loop={bgVideos.length <= 1}
            playsInline
            preload="metadata"
            onEnded={advanceBg}
            onError={advanceBg}
            className="w-full h-full object-cover opacity-35 scale-110 blur-[1px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/65 to-[#02040a]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.20),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.18),transparent_50%)]" />
        </div>
      ) : null}
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm border-y-2 border-emerald-500 pointer-events-none">
           <div className="text-center animate-bounce">
              <svg className="w-20 h-20 text-emerald-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
              <h3 className="text-4xl font-black text-white tracking-widest">松开以上传作品</h3>
           </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">精选作品 / WORKS</h2>
            <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.5em] pt-2 text-glow">
              // Cinematic AI Video Productions
            </p>
          </div>
        </div>

        {displayWorks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
              {displayWorks.map((work) => (
                <div key={work.id} className="group relative w-full bg-black/40 backdrop-blur-md rounded-[32px] overflow-hidden border border-white/10 shadow-2xl hover:border-emerald-500/50 transition-all duration-500">
                  
                  {/* Media Render Logic */}
                  {work.type === 'bilibili' ? (
                     <div className="relative w-full aspect-video">
                        <iframe 
                            src={work.url} 
                            scrolling="no" 
                            frameBorder="0" 
                            allowFullScreen 
                            className="absolute inset-0 w-full h-full z-10"
                        ></iframe>
                     </div>
                  ) : work.type === 'video' ? (
                    // ✅ 修复：移除 poster，浏览器将自动加载视频第一帧
                    <video 
                        src={work.url} 
                        // poster 属性已移除，不使用封面
                        controls 
                        className="w-full h-auto block outline-none bg-black" 
                        playsInline
                        preload="metadata"
                    />
                  ) : (
                    <img src={work.url} alt={work.name} className="w-full h-auto block" />
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                     <p className="text-[10px] text-white/70 truncate uppercase font-mono">{work.name}</p>
                  </div>
                  
                  {/* Delete button only for Local Works (Dynamic uploads) */}
                  {!STATIC_WORKS.find(sw => sw.id === work.id) && (
                    <button onClick={() => handleDelete(work.id)} className="absolute top-4 right-4 z-30 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl backdrop-blur-md cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[48px] h-[50vh] text-slate-500 italic text-[10px] tracking-[0.5em] font-black group hover:border-emerald-500/30 hover:bg-white/[0.02] transition-colors relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="mb-6 p-6 rounded-full bg-white/5 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors relative z-10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              </div>
              <p className="relative z-10">PASTE OR DROP WORKS HERE</p>
            </div>
        )}
      </div>
    </section>
  );
};

export default WorksGallery;

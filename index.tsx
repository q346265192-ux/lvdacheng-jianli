import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import WorksGallery from './WorksGallery';
import { WORKS_VIDEO_URLS } from './worksCatalog';

/**
 * VISIONARY 16.8 - "WECHAT COMPATIBILITY PATCH"
 * 架构修正：
 * 1. 修复微信浏览器/移动端 WebView 视频自动播放失效时显示错误封面的问题。
 * 2. 移除 Hero 区域错误的 Poster 引用，强制使用视频第一帧。
 * 3. 增加 X5 内核专用属性，优化微信内播放体验。
 */

// --- USER CONFIGURATION (用户背景配置区) ---
// ✅ 阿里云 OSS 高速直链 (北京节点)
const HERO_VIDEO_SOURCE = "https://lvdacheng.oss-cn-beijing.aliyuncs.com/x9.mp4"; 

const localAsset = (name: string) => new URL(`./assets/${name}`, import.meta.url).href;

// --- ARCHITECT CONFIGURATION (架构师配置区) ---
const icons = {
  Setup: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  Script: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  Asset: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>,
  Grid: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>,
  Control: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>,
  Motion: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Distro: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
};

// ⚠️ STATIC DATA STRUCTURE - Mapped based on Suffix = Step Number logic
const INITIAL_STEPS: { title: string; desc: string; icon: React.ReactNode; images: string[]; defaultUrl?: string }[] = [
  {
    title: "环境初始化 (Project Setup)",
    desc: "多模态工作流构建，支持影视/TVC/动画三种核心模式，智能解析产品卖点与视觉风格锚定。",
    icon: icons.Setup,
    images: [
        localAsset('01_setup_1.png'),
        localAsset('02_setup_1.png'),
        localAsset('03_setup_1.png'),
        localAsset('04_setup_1.png'),
        localAsset('05_setup_1.png'),
    ]
  },
  {
    title: "脚本与分镜 (Script & Storyboard)",
    desc: "双核脚本引擎，AI 自动拆解分镜，支持专业术语（景别/运镜/光影）的精确控制与即时润色。",
    icon: icons.Script,
    images: [
        localAsset('01_setup_2.png'),
        localAsset('02_setup_2.png'),
        localAsset('02_script_1.png'),
    ]
  },
  {
    title: "资产一致性 (Asset Consistency)",
    desc: "建立项目专属资产库，从脚本提取角色与道具，确保全片视觉一致性 (Consistency) 与面部特征固定。",
    icon: icons.Asset,
    images: [
        localAsset('01_setup_3.png')
    ]
  },
  {
    title: "全景网格 (The Grid)",
    desc: "Gemini 3 Pro 驱动的视觉接触表 (Contact Sheet) 生成，一次性预览 9 宫格全片色调与构图流向。",
    icon: icons.Grid,
    images: [
        localAsset('01_setup_4.png'),
        localAsset('02_setup_4.png'),
        localAsset('04_setup_4.png')
    ]
  },
  {
    title: "导演调度 (Director's Control)",
    desc: "精细化分镜控制，支持虚拟摄影机运镜、重绘、构图指引及复杂的局部修饰 (Inpainting)。",
    icon: icons.Control,
    images: [
        localAsset('01_setup_5.png'),
        localAsset('02_setup_5.png'),
        localAsset('03_setup_5.png'),
        localAsset('04_setup_5.png'),
        localAsset('05_setup_5.png'),
        localAsset('06_setup_5.png'),
        localAsset('07_setup_5.png'),
        localAsset('08_setup_5.png'),
        localAsset('09_setup_5.png'),
        localAsset('10_setup_5.png'),
        localAsset('11_setup_5.png'),
        localAsset('12_setup_5.png'),
        localAsset('13_setup_5.png'),
    ]
  },
  {
    title: "动态生成 (Motion Generation)",
    desc: "接入 Google Veo 模型，将静态分镜转化为具有物理连贯性的 4K 动态视频片段，支持多语种提示词优化。",
    icon: icons.Motion,
    images: [
        localAsset('01_setup_6.png')
    ]
  },
  {
    title: "宣发闭环 (Distribution)",
    desc: "一键生成适配小红书/抖音/YouTube 的爆款封面、标题矩阵及元数据标签，完成宣发闭环。",
    icon: icons.Distro,
    images: [
        localAsset('01_setup_7.png')
    ]
  }
];

// --- Visual Components ---

const ParticleNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    const PARTICLE_COUNT = Math.min(100, (width * height) / 15000);
    const CONNECTION_DISTANCE = 150;
    const MOUSE_DISTANCE = 200;
    const PARTICLE_COLOR = 'rgba(16, 185, 129, 0.6)';
    const LINE_COLOR = '16, 185, 129';
    const mouse = { x: -1000, y: -1000 };
    class Particle {
      x: number; y: number; vx: number; vy: number; size: number;
      constructor() { this.x = Math.random() * width; this.y = Math.random() * height; this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5; this.size = Math.random() * 2 + 0.5; }
      update() { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > width) this.vx *= -1; if (this.y < 0 || this.y > height) this.vy *= -1; const dx = mouse.x - this.x; const dy = mouse.y - this.y; const distance = Math.sqrt(dx * dx + dy * dy); if (distance < MOUSE_DISTANCE) { const forceDirectionX = dx / distance; const forceDirectionY = dy / distance; const force = (MOUSE_DISTANCE - distance) / MOUSE_DISTANCE; this.x -= forceDirectionX * force * 0.5; this.y -= forceDirectionY * force * 0.5; } }
      draw() { if (!ctx) return; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fillStyle = PARTICLE_COLOR; ctx.fill(); }
    }
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
    const animate = () => { ctx.clearRect(0, 0, width, height); particles.forEach(p => { p.update(); p.draw(); }); for (let i = 0; i < particles.length; i++) { for (let j = i + 1; j < particles.length; j++) { const dx = particles[i].x - particles[j].x; const dy = particles[i].y - particles[j].y; const distance = Math.sqrt(dx * dx + dy * dy); if (distance < CONNECTION_DISTANCE) { const opacity = 1 - distance / CONNECTION_DISTANCE; ctx.beginPath(); ctx.strokeStyle = `rgba(${LINE_COLOR}, ${opacity * 0.4})`; ctx.lineWidth = 0.5; ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke(); } } } particles.forEach(p => { const dx = mouse.x - p.x; const dy = mouse.y - p.y; const dist = Math.sqrt(dx*dx + dy*dy); if(dist < MOUSE_DISTANCE) { const opacity = 1 - dist / MOUSE_DISTANCE; ctx.beginPath(); ctx.strokeStyle = `rgba(${LINE_COLOR}, ${opacity * 0.5})`; ctx.lineWidth = 0.5; ctx.moveTo(mouse.x, mouse.y); ctx.lineTo(p.x, p.y); ctx.stroke(); } }); requestAnimationFrame(animate); };
    animate();
    const handleResize = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; };
    const handleMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('resize', handleResize); window.addEventListener('mousemove', handleMouseMove);
    return () => { window.removeEventListener('resize', handleResize); window.removeEventListener('mousemove', handleMouseMove); };
  }, []);
  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
};

const CinematicBackdrop = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null); 
  const [isCustom, setIsCustom] = useState(false);

  // Simplified Hero: Removed IndexedDB logic for hero background
  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => { 
      if (e.target.files && e.target.files[0]) { 
          const file = e.target.files[0]; 
          const url = URL.createObjectURL(file); 
          setVideoSrc(url); 
          setIsCustom(true); 
      } 
  };
  const resetHero = () => { setVideoSrc(null); setIsCustom(false); };
  const isBilibili = videoSrc?.includes("bilibili");

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        html { scroll-behavior: smooth; }
        .mesh-bg { background-color: #02040a; background-image: radial-gradient(circle at 50% 50%, #0f172a 0%, #02040a 80%); }
        .font-visionary { font-family: 'Inter', sans-serif; font-weight: 900; letter-spacing: -0.04em; }
        .titanium-card { background: linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(24px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .text-glow { text-shadow: 0 0 20px rgba(255, 255, 255, 0.3); }
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        .scanline-effect { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 0%, rgba(16, 185, 129, 0.05) 50%, transparent 100%); animation: scanline 4s linear infinite; pointer-events: none; }
        .viewport-scroll::-webkit-scrollbar, .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .viewport-scroll::-webkit-scrollbar-track, .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
        .viewport-scroll::-webkit-scrollbar-thumb, .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.3); border-radius: 3px; }
        .viewport-scroll::-webkit-scrollbar-thumb:hover, .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.6); }
        .hero-video-layer { filter: contrast(1.1) brightness(0.8) saturate(0.8); }
        .bilibili-bg-iframe { pointer-events: none; transform: scale(1.35); }
      `}} />
      <div className="fixed inset-0 z-[-1] overflow-hidden mesh-bg">
        <div className="absolute inset-0 z-0">
            {isCustom && videoSrc ? (
                 <div className="absolute inset-0 z-10" style={{ maskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 40%, transparent 100%)' }}>
                    {isBilibili ? <iframe src={videoSrc} scrolling="no" frameBorder="0" allowFullScreen allow="autoplay; encrypted-media" className="w-full h-full bilibili-bg-iframe"></iframe> : <video key={videoSrc} src={videoSrc} className="w-full h-full object-cover hero-video-layer" autoPlay muted loop playsInline />}
                </div>
            ) : ( <ParticleNetwork /> )}
        </div>
        <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] bg-indigo-900/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-900/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }}></div>
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group/bgctrl">
            <label className="cursor-pointer">
                <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleHeroUpload} />
                <div className="flex items-center gap-2 px-4 py-2 bg-black/60 border border-white/10 rounded-full backdrop-blur-md text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-emerald-500 hover:text-black hover:scale-105 transition-all shadow-xl">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 00-2 2z"/></svg>
                    {isCustom ? "Custom Video Active" : "Customize Background"}
                </div>
            </label>
            {isCustom && ( <button onClick={resetHero} className="text-[9px] text-red-500/50 hover:text-red-500 uppercase tracking-wider underline">Revert to System Mesh</button> )}
        </div>
      </div>
    </>
  );
};

const Badge = ({ children, color = "emerald" }: { children?: React.ReactNode, color?: "emerald" | "blue" | "slate" }) => {
  const styles = { emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400", blue: "border-blue-500/30 bg-blue-500/10 text-blue-400", slate: "border-slate-500/30 bg-slate-500/10 text-slate-300" };
  return <span className={`px-4 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase border backdrop-blur-md ${styles[color]}`}>{children}</span>;
};

const SectionTitle = ({ children, en, sub }: { children?: React.ReactNode, en: string, sub?: React.ReactNode }) => (
  <div className="mb-16">
    <div className="flex flex-col gap-2">
      <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em]">{en}</span>
      <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">{children}</h3>
      {sub ? (
        <div className="pt-3 text-sm md:text-base text-slate-300 font-medium leading-relaxed">
          {sub}
        </div>
      ) : null}
    </div>
    <div className="h-1 w-20 bg-emerald-500 mt-6 rounded-full" />
  </div>
);

const ResumeSection = () => {
  return (
    <section id="resume" className="py-32 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-24">
            <div className="titanium-card rounded-3xl p-10 md:p-14 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] font-black text-[150px] leading-none tracking-tighter select-none pointer-events-none">V</div>
              <div className="relative z-10 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight">BIGOrange</h2>
                        <span className="px-3 py-1 bg-white text-black text-[10px] font-black tracking-widest uppercase rounded">Pro</span>
                    </div>
                    <p className="text-emerald-400 font-bold tracking-widest text-sm uppercase">AI Video Workflow Workbench</p>
                  </div>
                  <div className="flex gap-8 bg-black/20 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <div><div className="text-4xl font-black text-white tracking-tight">90%</div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Efficiency</div></div>
                    <div className="w-px bg-white/10" />
                    <div><div className="text-4xl font-black text-white tracking-tight">2.5h</div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Production</div></div>
                  </div>
                </div>
                <div className="space-y-8">
                  <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-medium">以 <span className="text-white border-b-2 border-emerald-500">Build</span> 快速搭建 BIGOrange 工作台原型，<span className="text-white border-b-2 border-emerald-500">Trae</span> 负责功能扩展与工程化收敛，形成稳定可复用的 AI 视频生成流水线（脚本→分镜→生成→剪辑→交付）。</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
                        <h4 className="text-white font-bold text-lg mb-2">自动化流</h4><p className="text-slate-400 text-sm font-medium leading-relaxed">整合 Gemini(逻辑)、Banana Pro(图像)与 Veo 3.1(视频)的全链路。</p>
                     </div>
                     <div className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></div>
                        <h4 className="text-white font-bold text-lg mb-2">一致性控制</h4><p className="text-slate-400 text-sm font-medium leading-relaxed">首创 Cinematic Matrix 与 ID Lock，解决角色长镜头飘移难题。</p>
                     </div>
                     <div className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 00-2 2z"/></svg></div>
                        <h4 className="text-white font-bold text-lg mb-2">精细运镜</h4><p className="text-slate-400 text-sm font-medium leading-relaxed">支持 Pan/Tilt/Zoom 及 30秒+ 长镜头，突破传统 AI 视频时长限制。</p>
                     </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-16">
              <SectionTitle en="Experience">职业征程</SectionTitle>
              <div className="relative border-l-2 border-white/10 ml-4 md:ml-6 space-y-16">
                <div className="relative pl-12 group">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-[#02040a] shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  <div className="titanium-card p-10 rounded-2xl hover:border-emerald-500/50 transition-all duration-300">
                    <div className="flex flex-col md:flex-row justify-between mb-6 gap-4 border-b border-white/10 pb-6">
                      <div><h4 className="text-2xl font-black text-white mb-2">赢商网 (Winshang) / 赢石营销</h4><div className="flex items-center gap-3"><span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">视频编导</span><span className="w-1 h-1 bg-slate-500 rounded-full" /><span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Workflow Architect</span></div></div>
                      <div className="text-slate-400 font-bold text-sm bg-black/20 px-4 py-2 rounded-lg h-fit">2022.07 - 2025.06</div>
                    </div>
                    <div className="space-y-6">
                      <p className="text-slate-300 text-lg leading-relaxed font-medium">负责头部商业地产媒体《总经理带你逛》栏目的 SOP 建立。通过架构 AI 工作流，解决传统访谈视频后期繁琐的痛点。</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5"><h5 className="text-white font-bold mb-2 flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"/> 录音清洗与脚本架构</h5><p className="text-sm text-slate-400 font-medium">利用 Gemini API 自动化处理 3小时+ 的原始访谈录音，智能降噪并提炼核心逻辑脚本，使前期策划效率提升 300%。</p></div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5"><h5 className="text-white font-bold mb-2 flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"/> 爆款产出</h5><p className="text-sm text-slate-400 font-medium">优化视听语言与内容密度，单条视频全网曝光量突破 <span className="text-white font-black">150万+</span>，确立行业标杆地位。</p></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative pl-12 group">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-700 border-4 border-[#02040a] group-hover:bg-blue-500 transition-colors" />
                  <div className="bg-white/[0.02] border border-white/10 p-8 rounded-2xl hover:bg-white/[0.04] transition-all">
                    <div className="flex flex-col md:flex-row justify-between mb-4 gap-2"><h4 className="text-xl font-bold text-white">广州瓯珠粤明文化</h4><span className="text-slate-500 font-bold text-sm">2020.11 - 2022.06</span></div>
                    <p className="text-blue-400 font-bold text-xs uppercase tracking-wider mb-6">摄像剪辑师 & 内容编导 / Creator</p>
                    <p className="text-slate-300 text-base leading-relaxed font-medium mb-4">深耕 <span className="text-white font-bold">3C 数码类目</span>。负责品牌账号从 0 到 1 的孵化建设。</p>
                    <ul className="list-disc list-inside text-slate-400 text-sm space-y-2 marker:text-blue-500"><li>主导数码产品的拍摄与后期制作，严格把控画质审美与光影质感。</li><li>负责短视频内容策划，通过高密度的信息输出与快节奏剪辑打造账号风格，实现多条爆款内容产出。</li></ul>
                  </div>
                </div>
                <div className="relative pl-12 group">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-700 border-4 border-[#02040a] group-hover:bg-orange-500 transition-colors" />
                  <div className="bg-white/[0.02] border border-white/10 p-8 rounded-2xl hover:bg-white/[0.04] transition-all">
                    <div className="flex flex-col md:flex-row justify-between mb-4 gap-2"><h4 className="text-xl font-bold text-white">广东骆驼服饰有限公司</h4><span className="text-slate-500 font-bold text-sm">2017.10 - 2020.10</span></div>
                    <p className="text-orange-400 font-bold text-xs uppercase tracking-wider mb-6">摄像剪辑师 / Content Editor</p>
                    <p className="text-slate-300 text-base leading-relaxed font-medium">负责天猫旗舰店主图视频生产。在双十一等S级大促节点，通过高度标准化的制作流程，保障高强度、大批量的工业化视频内容产出，有效提升店铺转化率。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-12">
            <div className="titanium-card rounded-3xl p-8 sticky top-32 space-y-12">
              <div className="space-y-8"><h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3"><span className="w-8 h-px bg-slate-500"></span> Tech Stack</h4><div className="space-y-6"><div><p className="text-[10px] text-emerald-500 font-black mb-3 uppercase tracking-widest">AI Engineering</p><div className="flex flex-wrap gap-2">{["Banana Pro", "Trae", "Gemini API", "Prompt Eng.", "ComfyUI", "Seedance 2.0", "TapNow", "Lovart"].map(s => (<span key={s} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs font-bold text-emerald-100">{s}</span>))}</div></div><div><p className="text-[10px] text-blue-500 font-black mb-3 uppercase tracking-widest">Creative Core</p><div className="flex flex-wrap gap-2">{["Premiere Pro", "剪映", "After Effects", "DaVinci Resolve", "Photoshop", "编导", "摄影", "摄像"].map(s => (<span key={s} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-bold text-blue-100">{s}</span>))}</div></div></div></div>
              <div className="h-px bg-white/10 w-full" />
              <div className="space-y-6"><h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3"><span className="w-8 h-px bg-slate-500"></span> Education</h4><div><p className="text-lg font-black text-white">湖南工业大学</p><p className="text-xs font-bold text-slate-400 mt-1">新闻学 / Journalism</p><p className="text-xs font-bold text-slate-500 mt-1">2013 - 2017 | Bachelor's Degree</p></div></div>
              <div className="space-y-6 pt-4"><h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3"><span className="w-8 h-px bg-slate-500"></span> Contact</h4><div className="space-y-4"><div className="flex items-center gap-4 group cursor-pointer"><div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-emerald-500 group-hover:text-black transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></div><div><p className="text-[10px] text-slate-500 font-bold uppercase">Mobile</p><p className="text-base font-bold text-white tracking-tight">188 6731 9350</p></div></div><div className="flex items-center gap-4 group cursor-pointer"><div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-blue-500 group-hover:text-black transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></div><div><p className="text-[10px] text-slate-500 font-bold uppercase">Email</p><p className="text-base font-bold text-white tracking-tight">346265192@qq.com</p></div></div></div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const LightboxViewer = ({
  open,
  steps,
  stepIndex,
  imageIndex,
  onClose,
  onSetStep,
  onSetImage,
}: {
  open: boolean;
  steps: { title: string; desc: string; images: string[] }[];
  stepIndex: number;
  imageIndex: number;
  onClose: () => void;
  onSetStep: (next: number) => void;
  onSetImage: (next: number) => void;
}) => {
  const step = steps[Math.max(0, Math.min(stepIndex, steps.length - 1))];
  const images = step?.images ?? [];
  const safeIndex = images.length > 0 ? Math.max(0, Math.min(imageIndex, images.length - 1)) : 0;
  const currentImage = images.length > 0 ? images[safeIndex] : '';
  const stepLabel = step?.title?.split(' (')[0] ?? '';
  const stepEn = step?.title?.match(/\((.*?)\)/)?.[1] ?? '';

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'ArrowRight') {
        if (images.length <= 0) return;
        e.preventDefault();
        onSetImage((safeIndex + 1) % images.length);
        return;
      }
      if (e.key === 'ArrowLeft') {
        if (images.length <= 0) return;
        e.preventDefault();
        onSetImage((safeIndex - 1 + images.length) % images.length);
        return;
      }
      if (e.key === 'ArrowDown') {
        if (steps.length <= 0) return;
        e.preventDefault();
        onSetStep((stepIndex + 1) % steps.length);
        onSetImage(0);
        return;
      }
      if (e.key === 'ArrowUp') {
        if (steps.length <= 0) return;
        e.preventDefault();
        onSetStep((stepIndex - 1 + steps.length) % steps.length);
        onSetImage(0);
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, images.length, onClose, onSetImage, onSetStep, safeIndex, stepIndex, steps.length]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-xl"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-5 flex items-start justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className="space-y-2">
          <div className="text-[10px] font-black tracking-[0.35em] uppercase text-emerald-400">{stepEn || 'VIEWPORT'}</div>
          <div className="text-xl md:text-2xl font-black text-white tracking-tight">{stepLabel}</div>
          <div className="text-[11px] font-bold text-slate-300 opacity-80">←/→ 切换图片　↑/↓ 切换步骤　Esc 关闭</div>
        </div>
        <button
          className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white text-xs font-black tracking-[0.2em] uppercase hover:bg-white hover:text-black transition-colors"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <div className="absolute inset-0 pt-24 pb-28 overflow-y-auto overscroll-contain">
        <div className="min-h-full flex items-start justify-center px-6 py-6">
          {currentImage ? (
            <img
              src={currentImage}
              alt={stepLabel}
              className="rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.65)] border border-white/10 bg-black/30"
              style={{ width: 'min(1600px, 94vw)', height: 'auto' }}
            />
          ) : (
            <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
              <div className="text-[10px] font-black tracking-[0.5em] text-slate-500 uppercase">NO IMAGE</div>
              <div className="mt-4 text-slate-300 font-bold">{stepLabel}</div>
              <div className="mt-2 text-slate-500 text-sm font-medium leading-relaxed">{step?.desc}</div>
            </div>
          )}
        </div>
      </div>

      {images.length > 1 ? (
        <>
          <button
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-black/40 hover:bg-emerald-500 hover:text-black text-white backdrop-blur transition-colors"
            onClick={() => onSetImage((safeIndex - 1 + images.length) % images.length)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-black/40 hover:bg-emerald-500 hover:text-black text-white backdrop-blur transition-colors"
            onClick={() => onSetImage((safeIndex + 1) % images.length)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
          </button>
        </>
      ) : null}

      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="w-28 shrink-0">
            <div className="text-[10px] font-black tracking-[0.35em] uppercase text-slate-500">IMAGE</div>
            <div className="text-sm font-black text-white mt-1">{images.length > 0 ? `${safeIndex + 1}/${images.length}` : '0/0'}</div>
          </div>
          <div className="flex-1 min-w-0 flex gap-3 overflow-x-auto py-1 custom-scrollbar items-center">
            {images.map((img, idx) => (
              <button
                key={img}
                onClick={() => onSetImage(idx)}
                className={`relative flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden border-2 transition-all ${idx === safeIndex ? 'border-emerald-500 scale-105 shadow-[0_0_18px_rgba(16,185,129,0.35)]' : 'border-white/10 opacity-60 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SystemDemo = () => {
  const [activeId, setActiveId] = useState(0);
  const [subActiveIndex, setSubActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  const currentStep = INITIAL_STEPS[activeId];
  // Safe Access to Images
  const currentImage = currentStep.images && currentStep.images.length > 0 
    ? currentStep.images[Math.min(subActiveIndex, currentStep.images.length - 1)]
    : currentStep.defaultUrl || "";

  const queueLength = currentStep.images ? currentStep.images.length : 0;

  return (
    <section id="demo" className="py-32 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <SectionTitle
          en="WORKFLOW TOUR"
          sub={
            <span className="text-slate-300">
              快速体验：
              <a
                href="https://visionary-7yy.pages.dev/#"
                target="_blank"
                rel="noreferrer"
                className="ml-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-colors font-black text-[11px] tracking-[0.2em] uppercase"
              >
                大橙AI视频创意工作台
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 3h7m0 0v7m0-7L10 14"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5v14a2 2 0 002 2h14"/></svg>
              </a>
              <span className="ml-3 text-slate-500 text-xs font-bold">（新窗口打开）</span>
            </span>
          }
        >
          全流程功能导览
        </SectionTitle>

        <div className="titanium-card rounded-3xl overflow-hidden border border-white/10 bg-[#0a0c10] flex flex-col lg:flex-row min-h-[750px] shadow-2xl">
           
           {/* Left Navigation */}
           <div className="lg:w-1/4 border-r border-white/5 bg-black/40 flex flex-col">
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)] bg-emerald-500"/>
                  System Online
                </h4>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-mono text-slate-500">v16.7.0</span>
                  <div className="flex gap-2 mt-1">
                      <span className="text-[8px] text-emerald-500 font-bold tracking-wider">LOCAL ASSETS</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {INITIAL_STEPS.map((step, index) => (
                   <button key={index} onClick={() => { setActiveId(index); setSubActiveIndex(0); }} className={`w-full text-left p-4 rounded-xl transition-all border group relative overflow-hidden ${activeId === index ? 'bg-white/10 border-emerald-500/50 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-transparent border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}>
                      <div className="relative z-10 flex gap-4 items-start">
                        <div className={`p-2 rounded-lg transition-colors ${activeId === index ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-600 group-hover:text-slate-400'}`}>{step.icon}</div>
                        <div className="flex-1">
                          <div className={`text-[9px] font-black uppercase tracking-wider mb-1 ${activeId === index ? 'text-emerald-400' : 'text-slate-600'}`}>Step 0{index + 1}</div>
                          <div className="font-bold text-sm tracking-wide leading-snug whitespace-normal break-words">{step.title.split(' (')[0]}</div>
                        </div>
                      </div>
                      <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent transition-transform duration-500 ${activeId === index ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'}`} />
                   </button>
                ))}
              </div>
           </div>

           {/* Right Display */}
           <div className="flex-1 min-w-0 relative bg-black flex flex-col">
              
              {/* Monitor Header */}
              <div className="absolute top-0 left-0 right-0 z-30 px-6 py-4 flex justify-between items-start pointer-events-none bg-gradient-to-b from-black/80 to-transparent">
                 <div className="flex items-center gap-4 pointer-events-auto">
                     <div className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded flex items-center gap-2 backdrop-blur-md">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">LOCAL ASSETS</span>
                     </div>
                     <button
                        onClick={() => setIsLightboxOpen(true)}
                        className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-full text-[9px] font-black text-white tracking-[0.25em] hover:bg-white hover:text-black transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>
                        全屏
                      </button>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest font-mono">{currentStep.title.match(/\((.*?)\)/)?.[1] || "VIEWPORT"}</div>
                    <div className="text-[9px] text-slate-500 font-mono">MATRIX | {queueLength > 0 ? `${subActiveIndex + 1}/${queueLength}` : '0/0'}</div>
                 </div>
              </div>

              {/* Smart Viewport */}
              <div className="flex-1 min-w-0 relative overflow-hidden flex items-center justify-center bg-[#050505] group select-none">
                 
                 {/* Blurred BG */}
                 <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    {currentImage ? (
                      <img src={currentImage} className="w-full h-full object-cover blurred-bg-layer opacity-40" alt="ambiance" />
                    ) : null}
                 </div>

                 <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden viewport-scroll custom-scrollbar pt-20 overscroll-contain">
                    <div className="relative w-full min-h-full flex items-start justify-center px-6 pb-10">
                        {currentImage ? (
                          <img 
                              key={currentImage}
                              src={currentImage} 
                              alt={currentStep.title} 
                              className="w-full max-w-[1200px] h-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-lg transition-opacity duration-500 cursor-zoom-in" 
                              style={{ display: 'block' }} 
                              onClick={() => setIsLightboxOpen(true)}
                          />
                        ) : (
                          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
                            <div className="text-[10px] font-black tracking-[0.5em] text-slate-500 uppercase">NO LOCAL IMAGE</div>
                            <div className="mt-4 text-slate-300 font-bold">{currentStep.title.split(' (')[0]}</div>
                            <div className="mt-2 text-slate-500 text-sm font-medium leading-relaxed">{currentStep.desc}</div>
                          </div>
                        )}
                    </div>
                 </div>
                 <div className="scanline-effect z-20 opacity-20 pointer-events-none" />

                 {/* Controls */}
                 {queueLength > 1 && (
                    <>
                      <button onClick={() => setSubActiveIndex(prev => (prev > 0 ? prev - 1 : queueLength - 1))} className="absolute left-6 z-40 p-3 bg-black/40 hover:bg-emerald-500 hover:text-black rounded-full text-white backdrop-blur transition-all opacity-0 group-hover:opacity-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg></button>
                      <button onClick={() => setSubActiveIndex(prev => (prev < queueLength - 1 ? prev + 1 : 0))} className="absolute right-6 z-40 p-3 bg-black/40 hover:bg-emerald-500 hover:text-black rounded-full text-white backdrop-blur transition-all opacity-0 group-hover:opacity-100"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg></button>
                    </>
                 )}
              </div>

              {/* Bottom Reel */}
              <div className="h-28 bg-[#020202] border-t border-white/5 flex items-center px-6 gap-4 z-20 min-w-0 overflow-hidden">
                 <div className="w-20 flex flex-col items-center justify-center border-r border-white/5 pr-4"><span className="text-[10px] font-black text-slate-500 uppercase">QUEUE</span><span className="text-2xl font-black text-white">{queueLength}</span></div>
                 <div className="flex-1 min-w-0 flex gap-3 overflow-x-auto py-2 custom-scrollbar items-center">
                    {currentStep.images && currentStep.images.map((img, idx) => (
                       <div key={idx} onClick={() => setSubActiveIndex(idx)} className={`relative flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all group/item ${subActiveIndex === idx ? 'border-emerald-500 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'border-white/10 opacity-40 hover:opacity-100'}`}>
                          <img src={img} className="w-full h-full object-cover" />
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
      <LightboxViewer
        open={isLightboxOpen}
        steps={INITIAL_STEPS}
        stepIndex={activeId}
        imageIndex={subActiveIndex}
        onClose={() => setIsLightboxOpen(false)}
        onSetStep={(next) => {
          setActiveId(next);
          setSubActiveIndex(0);
        }}
        onSetImage={(next) => setSubActiveIndex(next)}
      />
    </section>
  );
};

const Hero = () => {
  return (
    <section className="relative h-screen flex flex-col justify-center px-6 pt-20 z-10">
      <div className="max-w-7xl mx-auto w-full">
        <div className="space-y-8">
           <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
              <span className="text-xs font-black text-emerald-400 tracking-[0.2em] uppercase">System Online • v16.7 OSS</span>
           </div>
           
           <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.9] mix-blend-overlay opacity-90">
             BIGOrange
             <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-white text-6xl md:text-8xl mt-2">
               ARCHITECT
             </span>
           </h1>
           
           <div className="max-w-2xl">
             <p className="text-xl md:text-2xl text-slate-400 font-medium leading-relaxed border-l-2 border-emerald-500 pl-6">
               <span className="text-white font-bold">全栈 AI 视频工作流</span> (Full-Stack AI Video Workflow). 
               集成 Gemini 3 Pro 逻辑大脑与 Veo 3.1 视觉引擎，重新定义数字内容生产力。
             </p>
           </div>

           <div className="flex flex-wrap gap-6 pt-8">
              <a href="#works" className="px-8 py-4 bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 transition-colors flex items-center gap-3">
                 Explore Works <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
              </a>
              <a href="#resume" className="px-8 py-4 bg-transparent border border-white/20 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-colors">
                 Architect Profile
              </a>
           </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50">
        <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-white to-transparent" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-white font-black writing-mode-vertical">Scroll to Initialize</span>
      </div>
    </section>
  )
}

const Portfolio = () => {
  const navItems = [
    { label: '履历', id: 'resume' },
    { label: '引擎', id: 'demo' },
    { label: '作品', id: 'works' }
  ];
  const [heroBgIndex, setHeroBgIndex] = useState(0);
  const heroBgVideos = WORKS_VIDEO_URLS;
  const heroBgVideo = heroBgVideos.length > 0
    ? heroBgVideos[Math.min(heroBgIndex, heroBgVideos.length - 1)]
    : HERO_VIDEO_SOURCE;
  const advanceHeroBg = () => {
    if (heroBgVideos.length <= 1) return;
    setHeroBgIndex((i) => (i + 1) % heroBgVideos.length);
  };

  return (
    <div className="min-h-screen text-slate-200 selection:bg-emerald-500/30 font-sans tracking-tight">
      <CinematicBackdrop />

      {/* 极简导航 */}
      <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-3 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full flex gap-10 shadow-2xl">
        {navItems.map((item) => (
          <a 
            key={item.label} 
            href={`#${item.id}`} 
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {item.label}
          </a>
        ))}
      </nav>

      {/* Hero 展区 */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative z-10 overflow-hidden pt-20">
        {/* NEW: Background Video Layer - Absolute & Z-0 (Scrolls with content) */}
        <div className="absolute inset-0 z-0">
            <video
                key={heroBgVideo}
                src={heroBgVideo}
                autoPlay muted playsInline
                onEnded={advanceHeroBg}
                onError={advanceHeroBg}
                className="w-full h-full object-cover opacity-60 scale-105"
            />
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#020617]"></div>
            <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
        </div>

        <div className="space-y-16 relative z-10">
          <div className="flex flex-col items-center gap-6">
            <Badge color="slate">AI Video Workflow Architect</Badge>
            <h1 className="text-[15vw] md:text-[180px] font-visionary text-white leading-[0.8] tracking-tighter drop-shadow-2xl mix-blend-overlay opacity-90">
              BIGOrange
            </h1>
          </div>

          <div className="flex flex-col items-center transform -translate-y-4 md:-translate-y-8">
            <h2 className="text-7xl md:text-9xl font-black text-white tracking-tighter drop-shadow-lg mb-4">
              吕达成
            </h2>
            <div className="flex items-center gap-6 opacity-60">
              <div className="h-px w-16 bg-white/30" />
              <span className="text-sm md:text-lg font-bold tracking-[0.8em] uppercase text-slate-300">LU DACHENG</span>
              <div className="h-px w-16 bg-white/30" />
            </div>
          </div>
          
          <div className="w-full max-w-5xl mx-auto">
            <p className="text-slate-300 font-medium leading-relaxed text-xl md:text-2xl px-4 text-glow md:whitespace-nowrap">
              将非标创意解构为 <span className="text-white font-black border-b-2 border-emerald-500">标准化数据流</span>，实现 TVC 生产效率 <span className="text-emerald-400 font-black">90%</span> 的工业化跨越。
            </p>
            
            <div className="pt-12">
              <button 
                onClick={() => document.getElementById('resume')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative px-12 py-4 bg-white text-black font-black uppercase tracking-[0.3em] rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
              >
                <span className="relative z-10 text-xs">探索架构 / Explore</span>
                <div className="absolute inset-0 bg-emerald-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <ResumeSection />
      <SystemDemo />
      <WorksGallery />

      <footer className="py-24 text-center border-t border-white/5 bg-[#02040a] relative z-10">
        <p className="text-[10px] text-slate-600 font-black tracking-[1em] uppercase opacity-50">
          v16.7 / OSS Stable / 2025
        </p>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Portfolio />);

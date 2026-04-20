import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, ShoppingBag, Settings, Palette, Sparkles, Loader2, User, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateAuraResponse } from '../services/aiService';
import type { AuraMode, ChatMessage } from '../services/aiService';

// AI Avatar - Moved to public folder for browser compatibility
const AURA_AVATAR = '/aura-avatar.png';

const AuraChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuraMode | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show tooltip after a short delay
    const timer = setTimeout(() => setShowTooltip(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Hide tooltip permanently once opened
    if (isOpen) {
      setShowTooltip(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isLoading]);

  const handleStart = (selectedMode: AuraMode) => {
    setMode(selectedMode);
    const welcomeMessages: Record<AuraMode, string> = {
      shopping: "### Welcome to the Concierge Service\nI'm **Aura**, your personalized shopping curator. I've been briefed on our entire luxury collection. \n\n*What kind of elegance are we adding to your home today?*",
      technical: "### Expert Engineering Consultation\nGreetings. I am **Aura Technical**. My systems are synchronized with our product blueprints and energy metrics. \n\n*Which appliance shall we evaluate for performance?*",
      designer: "### Interior Harmony Studio\nI am **Aura Designer**. I specialize in the dialogue between space, texture, and function. \n\n*Let's define the aesthetic soul of your room together.*"
    };
    setMessages([{ 
      role: 'model', 
      content: welcomeMessages[selectedMode], 
      timestamp: Date.now() 
    }]);
  };

  const handleSend = async () => {
    if (!input.trim() || !mode || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateAuraResponse(mode, [...messages, userMessage]);
      setMessages(prev => [...prev, { role: 'model', content: response, timestamp: Date.now() }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `*A slight pulse in the connection...*\n\nI apologize, but I'm having trouble retrieving that data right now. Shall we try again?\n\n> **Technical Log**: ${error.message}`, 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMode(null);
    setMessages([]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans antialiased">
      {/* Chat Window */}
      {isOpen && (
        <div className="aura-glass mb-4 w-[380px] max-w-[calc(100vw-48px)] h-[580px] max-h-[calc(100vh-120px)] rounded-[32px] overflow-hidden flex flex-col animate-scale-in border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
          {/* Elite Header */}
          <div className="bg-slate-900 p-5 text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 blur-3xl -mr-12 -mt-12 rounded-full"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <img 
                  src={AURA_AVATAR} 
                  alt="Aura" 
                  className="w-10 h-10 rounded-xl object-cover border-2 border-white/20 shadow-lg"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-[3px] border-slate-900 rounded-full animate-pulse"></span>
              </div>
              <div>
                <h3 className="font-bold text-base tracking-tight">Aura</h3>
                <p className="text-[9px] font-semibold opacity-70 uppercase tracking-[0.2em] flex items-center gap-1.5">
                  {mode ? mode : 'Select Specialization'}
                  <span className="w-1 h-2.5 bg-white/30 rounded-full inline-block"></span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all duration-300"
            >
              <X size={18} />
            </button>
          </div>

          {/* Luxury Discussion Space */}
          <div className="flex-1 overflow-hidden relative flex flex-col bg-[#FDFDFF]">
            {!mode ? (
              /* High-End Persona Selection */
              <div className="p-8 flex flex-col gap-4 justify-center h-full animate-fade-in">
                <div className="mb-4">
                  <h4 className="text-2xl font-extrabold text-slate-900 leading-tight">Elevate your <br/>experience</h4>
                  <p className="text-xs text-slate-500 mt-2 font-medium">How may I serve you today?</p>
                </div>
                
                {[
                  { id: 'shopping', icon: <ShoppingBag size={20}/>, title: 'Concierge', desc: 'Personalized Shopping', bg: 'bg-indigo-50', text: 'text-indigo-600' },
                  { id: 'technical', icon: <Settings size={20}/>, title: 'Technical', desc: 'Precision & Specs', bg: 'bg-slate-100', text: 'text-slate-600' },
                  { id: 'designer', icon: <Palette size={20}/>, title: 'Aesthetic', desc: 'Design & Curation', bg: 'bg-rose-50', text: 'text-rose-600' }
                ].map((item, idx) => (
                  <button 
                    key={item.id}
                    onClick={() => handleStart(item.id as AuraMode)}
                    className={`group flex items-center justify-between p-4 rounded-[24px] bg-white border border-slate-100 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-500 animate-fade-in-up`}
                    style={{ animationDelay: `${idx * 150}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center ${item.text} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-bold text-base text-slate-800">{item.title}</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            ) : (
              /* Chat Thread - Fixed Overflow */
              <>
                <div 
                  ref={scrollRef} 
                  className="flex-1 p-6 overflow-y-auto overflow-x-hidden flex flex-col gap-8 scrollbar-thin"
                >
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {m.role !== 'user' && (
                        <div className="shrink-0 pt-1">
                          <img src={AURA_AVATAR} className="w-9 h-9 rounded-xl object-cover shadow-md border border-white" alt="AI"/>
                        </div>
                      )}
                      {m.role === 'user' && (
                        <div className="shrink-0 pt-1">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                            <User size={16} />
                          </div>
                        </div>
                      )}
                      
                      <div className={`flex flex-col gap-1.5 max-w-[85%]`}>
                        <div className={`
                          px-4 py-3 rounded-[22px] shadow-sm text-[13.5px] leading-relaxed break-words overflow-hidden
                          ${m.role === 'user' 
                            ? 'bg-slate-900 text-white rounded-tr-none' 
                            : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'}
                        `}>
                          <div className="prose prose-sm max-w-full prose-slate prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-900 prose-blockquote:border-slate-200 prose-blockquote:italic prose-a:text-indigo-600 prose-strong:text-inherit">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {m.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold text-slate-300 uppercase tracking-widest ${m.role === 'user' ? 'text-right pr-2' : 'pl-2'}`}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-4">
                      <img src={AURA_AVATAR} className="w-9 h-9 rounded-xl object-cover opacity-50 grayscale" alt="AI"/>
                      <div className="bg-white border border-slate-100 px-6 py-4 rounded-[28px] rounded-tl-none shadow-sm flex items-center gap-4">
                        <div className="flex gap-1.5">
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aura is consulting...</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Mode Selector & Control */}
                <div className="px-5 py-3 flex items-center justify-between bg-white border-t border-slate-50">
                  <button 
                    onClick={resetChat}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-100 hover:border-slate-900 text-[9px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-[0.1em] transition-all"
                  >
                    <Settings size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                    Reset Expertise
                  </button>
                </div>

                {/* Platinum Input Layer */}
                <div className="p-5 bg-white">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-slate-100 to-slate-200 rounded-[24px] opacity-0 group-focus-within:opacity-100 blur transition duration-500"></div>
                    <div className="relative flex items-center gap-3 bg-slate-50 rounded-[20px] px-5 py-3 border border-transparent focus-within:border-slate-200 focus-within:bg-white transition-all shadow-inner">
                      <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={`Address Aura ${mode}...`}
                        className="flex-1 bg-transparent text-xs font-semibold focus:outline-none placeholder:text-slate-400 text-slate-800"
                      />
                      <button 
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="w-10 h-10 rounded-[14px] bg-slate-900 text-white flex items-center justify-center hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] disabled:opacity-20 disabled:shadow-none transition-all duration-300"
                      >
                        <Send size={16} className="translate-x-0.5 -translate-y-0.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-center mt-3">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                      <Sparkles size={9} /> Powered by Aura Intelligence
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Concierge Activation Button & Tooltip */}
      <div className="relative flex flex-col items-end">
        {/* Helper Tooltip */}
        <div 
          className={`
            absolute bottom-full mb-4 right-2 pointer-events-none transition-all duration-700 ease-out origin-bottom-right
            ${showTooltip && !isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
          `}
        >
          <div className="bg-slate-900 text-white text-[13px] font-medium px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 w-max max-w-[250px]">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Sparkles size={14} className="text-amber-300" />
            </div>
            <div>
              <p>Need expert advice?</p>
              <p className="text-white/70 text-[11px] mt-0.5">Chat with Aura Concierge</p>
            </div>
            {/* Tooltip Triangle */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-slate-900 transform rotate-45 border-r border-b border-transparent"></div>
          </div>
        </div>

        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`
            group relative w-16 h-16 rounded-[24px] overflow-hidden shadow-[0_15px_40px_rgba(30,41,59,0.3)] hover:scale-105 active:scale-95 transition-all duration-500 animate-fade-in
            flex items-center justify-center
            ${isOpen ? 'bg-slate-900' : 'bg-white p-1'}
          `}
        >
          {!isOpen ? (
            <div className="w-full h-full relative group rounded-[22px] overflow-hidden">
              <img 
                src={AURA_AVATAR} 
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 brightness-95 group-hover:brightness-100" 
                alt="Aura" 
              />
              <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/40 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <MessageSquare size={20} className="text-white drop-shadow-md transform group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>
          ) : (
            <X size={24} className="text-white animate-scale-in" />
          )}
        </button>
      </div>
    </div>
  );
};


export default AuraChat;

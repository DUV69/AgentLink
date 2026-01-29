import React, { useState, useEffect, useRef } from 'react';
import { Agent, Message } from '../types';
import { chatWithAgent, translateText, generateSpeech, playBase64Audio, isTranslationNeeded } from '../services/geminiService';
import { Send, Bot, User, ArrowLeft, Loader2, Coins, FileSignature, AlertCircle, Image as ImageIcon, Link2, X, BadgeCheck, BrainCircuit, Mic, Fingerprint, Activity, Languages, Volume2, Radio, Globe, Trash2, Zap } from 'lucide-react';
import { useLanguage } from '../i18n';

interface ChatInterfaceProps {
  agent: Agent;
  onBack: () => void;
  onHire: () => void;
  isHired: boolean;
  onTip?: (amount: number) => boolean;
  onActivity?: () => void; 
  userPreferredLanguage?: string; // e.g. "Chinese"
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ agent, onBack, onHire, isHired, onTip, onActivity, userPreferredLanguage = 'English' }) => {
  const { t, language } = useLanguage();
  
  // Helper to infer agent's primary language based on location/config
  const getAgentLanguage = () => {
      // Priority 1: Check known language list
      if (agent.languages.some(l => l.includes('Chinese'))) return 'Chinese';
      if (agent.languages.some(l => l.includes('Japanese'))) return 'Japanese';
      if (agent.languages.some(l => l.includes('German'))) return 'German';
      
      // Priority 2: Location inference
      if (agent.location === 'China') return 'Chinese';
      if (agent.location === 'Japan') return 'Japanese';
      if (agent.location === 'Europe') return 'English'; // Generalize or specific
      
      return 'English'; // Default
  };

  const agentLanguage = getAgentLanguage();
  // Is the user's preferred language different from the agent's language?
  const isLanguageMismatch = userPreferredLanguage !== agentLanguage;

  // Translation Toggle - Default ON if mismatch
  const [isTranslationOn, setIsTranslationOn] = useState(isLanguageMismatch);

  // --- Long-term Memory Logic ---
  const STORAGE_KEY = `agentlinks_chat_history_${agent.id}`;

  const loadHistory = (): Message[] => {
      try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
              return JSON.parse(saved);
          }
      } catch (e) {
          console.error("Failed to load history", e);
      }
      
      return [{
        id: 'init',
        role: 'model',
        text: agent.isUserTwin 
          ? `Hey! I'm ${agent.name}. Currently AFK (Away From Keyboard) but available to chat here. What's on your mind?`
          : (isHired 
              ? `Ready to work. Send me tasks, photos, or questions.`
              : `Hi, I'm ${agent.name}. I'm currently looking for a job as a ${agent.category} specialist. Feel free to interview me.`),
        timestamp: Date.now()
      }];
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
      const history = loadHistory();
      setMessages(history);
      setHasLoaded(true);
  }, [agent.id, isHired]); 

  useEffect(() => {
      if (hasLoaded && messages.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      }
  }, [messages, hasLoaded, agent.id]);

  const clearHistory = () => {
      if (confirm('Clear permanent memory for this agent?')) {
          localStorage.removeItem(STORAGE_KEY);
          setMessages([{
            id: Date.now().toString(),
            role: 'model',
            text: "Memory cleared. Starting fresh.",
            timestamp: Date.now()
          }]);
      }
  };

  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTakingOver, setIsTakingOver] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [isTwinLive, setIsTwinLive] = useState(false);

  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null); 
  const isSendingRef = useRef(false); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
      // Auto-enable translation if languages differ
      setIsTranslationOn(isLanguageMismatch);
  }, [agentLanguage, userPreferredLanguage]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTakeoverRequest = () => {
      setIsTakingOver(true);
      setTimeout(() => {
          setIsTakingOver(false);
          setIsTwinLive(true); 
          const overrideMsg: Message = {
              id: Date.now().toString(),
              role: 'model',
              text: "Hey! I'm online now. This is the real human taking over. What's up?",
              timestamp: Date.now(),
              isHumanOverride: true
          };
          setMessages(prev => [...prev, overrideMsg]);
      }, 2500);
  };

  const startRecording = () => {
      if (!('webkitSpeechRecognition' in window)) {
          alert("Speech recognition not supported in this browser.");
          return;
      }
      
      const recognition = new (window as any).webkitSpeechRecognition();
      // Set recognition language to User's Preferred Language
      recognition.lang = userPreferredLanguage === 'Chinese' ? 'zh-CN' : 'en-US'; 
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
          setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
      };

      recognition.onend = () => {
          setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
  };

  const stopRecording = () => {
      if (recognitionRef.current) {
          recognitionRef.current.stop();
      }
  };


  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading || isSendingRef.current) return;

    isSendingRef.current = true; 

    if (onActivity) {
        onActivity();
        setShowReward(true);
        setTimeout(() => setShowReward(false), 2000);
    }

    const currentImage = selectedImage; 
    setSelectedImage(null); 
    const rawText = inputText;
    setInputText('');

    // --- STEP 1: Process OUTGOING (User -> Agent) ---
    // Even if I type Chinese, I want to show Chinese to myself.
    // If translation is ON, I send Chinese -> Translate to English -> Send to Agent.
    
    let textForAgent = rawText;
    let translatedForDisplay: string | undefined = undefined;

    if (isTranslationOn && isTranslationNeeded(rawText, agentLanguage)) {
         const translated = await translateText(rawText, agentLanguage);
         textForAgent = translated; 
         translatedForDisplay = translated; // Technically this is "User Language -> Agent Language"
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: rawText, // Show my original text as primary
      translatedText: translatedForDisplay, // Store the translation for context/debug
      image: currentImage || undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let contextInstruction = agent.systemInstruction;
      
      // Force Agent to speak its Native Language if strictly defined
      if (agentLanguage !== 'English') {
          contextInstruction += ` IMPORTANT: You are a native speaker of ${agentLanguage}. You MUST reply in ${agentLanguage} only.`;
      }

      if (agent.isUserTwin) {
          contextInstruction += ` Respond directly in the first person. Be conversational.`;
      } else if (!isHired) {
          contextInstruction += ` You are currently being interviewed for a job. Be professional.`;
      }

      // We send `textForAgent` (which is in Agent's language if translated) + History context
      const response = await chatWithAgent(
        agent.name,
        contextInstruction,
        messages, 
        textForAgent, 
        currentImage || undefined,
        agent.thinkingBudget
      );

      // --- STEP 2: Process INCOMING (Agent -> User) ---
      
      let finalResponseText = response.text; // This is likely in Agent's language (e.g., English)
      let translatedResponse: string | undefined = undefined;

      // CHECK FOR SKILL ACTIVATION PROTOCOL: [[SKILL:Name]]
      // If present, strip it and set activatedSkill
      let activatedSkillName: string | undefined = undefined;
      const skillRegex = /\[\[SKILL:(.*?)\]\]/;
      const skillMatch = finalResponseText.match(skillRegex);
      
      if (skillMatch) {
          activatedSkillName = skillMatch[1]; // Extract name
          finalResponseText = finalResponseText.replace(skillRegex, "").trim(); // Remove tag from text
      }

      // CRITICAL: We must translate the Agent's response to the User's preferred language
      if (isTranslationOn && isTranslationNeeded(finalResponseText, userPreferredLanguage)) {
          translatedResponse = await translateText(finalResponseText, userPreferredLanguage);
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: finalResponseText, // Original from Agent
        translatedText: translatedResponse, // Translated to User Language
        sources: response.sources,
        timestamp: Date.now(),
        activatedSkill: activatedSkillName
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      isSendingRef.current = false; 
    }
  };

  const isThinkingAgent = agent.thinkingBudget && agent.thinkingBudget > 0;
  const isTwin = agent.isUserTwin;
  const statusColor = isTwin
    ? (isTwinLive ? 'text-green-600' : 'text-indigo-500')
    : (isHired ? 'text-green-600' : 'text-orange-500');
  
  const dotColor = isTwin
    ? (isTwinLive ? 'bg-green-500 animate-pulse' : 'bg-indigo-500')
    : (isHired ? 'bg-green-500' : 'bg-orange-500');

  const statusText = isTwin
    ? (isTwinLive ? t('comm_status_human') : t('comm_status_auto'))
    : (isHired ? t('chat_hired_mode') : t('chat_interview_mode'));

  // --- Helper to Render Text with Images ---
  const renderMessageContent = (content: string) => {
      // Split by Markdown Images: ![alt](url)
      // Capture groups: 1=alt, 2=url
      const markdownImageRegex = /!\[(.*?)\]\((.*?)\)/g;
      
      // Also match raw URLs that end with image extensions if they are on their own line
      const parts = content.split(markdownImageRegex);
      
      // If no split happened, try checking if the whole text is an image URL
      if (parts.length === 1) {
          const rawUrlMatch = content.match(/^https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)$/i);
          if (rawUrlMatch) {
              return <img src={content} alt="content" className="max-w-full rounded-lg my-2 border border-gray-200" />;
          }
          return <div>{content}</div>;
      }

      const result = [];
      let i = 0;
      // .split with capture groups returns: [text, capture1, capture2, text, capture1, capture2...]
      // So stride is 3: [text segment, alt, url]
      while (i < parts.length) {
          const textSegment = parts[i];
          if (textSegment) {
              result.push(<span key={`text-${i}`}>{textSegment}</span>);
          }
          
          if (i + 2 < parts.length) {
              const alt = parts[i+1];
              const url = parts[i+2];
              result.push(
                  <div key={`img-${i}`} className="my-2">
                      <img src={url} alt={alt} className="max-w-full rounded-lg border border-gray-200" />
                  </div>
              );
              i += 3;
          } else {
              i++;
          }
      }
      return <div>{result}</div>;
  };

  return (
    <div className="absolute inset-0 bg-white z-40 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header - Fixed to Top, Padded for Dynamic Island */}
      <div className="pt-[60px] pb-3 border-b border-gray-100 flex items-center px-4 justify-between bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-sm transition-all">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            <span className="font-bold text-gray-900">{agent.name}</span>
            {agent.isOfficial && <BadgeCheck size={14} className="text-blue-500 fill-blue-100" />}
            {agent.isUserTwin && <div className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-[9px] font-bold">TWIN</div>}
          </div>
          
          <span className={`text-[10px] flex items-center gap-1 font-medium ${statusColor}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
            {statusText}
          </span>
        </div>
        
        {/* Actions Right Side */}
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsTranslationOn(!isTranslationOn)}
                className={`p-2 rounded-full transition-colors flex items-center justify-center ${isTranslationOn ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-100'}`}
                title="Toggle Translation"
            >
                <Languages size={20} />
                {isTranslationOn && <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border border-white"></span>}
            </button>

            <button onClick={clearHistory} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={20} />
            </button>

            {!isHired && !agent.isUserTwin ? (
                <button onClick={onHire} className="text-indigo-600">
                    <FileSignature size={24} />
                </button>
            ) : agent.isUserTwin ? (
                <button onClick={handleTakeoverRequest} disabled={isTakingOver || isTwinLive} className={`text-indigo-600 ${isTakingOver ? 'animate-pulse' : ''} ${isTwinLive ? 'opacity-30 cursor-default' : ''}`}>
                    <Fingerprint size={24} />
                </button>
            ) : (
                <button className="text-yellow-500">
                    <Coins size={24} />
                </button>
            )}
        </div>
      </div>

      {/* Banner - Moved Below Header to avoid Island issues */}
      {!isHired && !agent.isUserTwin && (
        <div className="bg-indigo-50 text-indigo-900 text-xs py-2 px-4 text-center flex justify-between items-center border-b border-indigo-100">
            <span className="font-bold opacity-90 flex items-center gap-1">
                <AlertCircle size={12} /> {t('chat_interview_mode')}
            </span>
            <button 
                onClick={onHire}
                className="bg-white text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black shadow-sm hover:bg-indigo-100 border border-indigo-100"
            >
                {t('chat_btn_hire')}
            </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        
        {/* Translation Banner Hint */}
        {isTranslationOn && (
            <div className="flex justify-center opacity-60 mb-2">
                <div className="text-[10px] bg-gray-200 text-gray-600 px-3 py-1 rounded-full flex items-center gap-2">
                    <Globe size={10} />
                    <span>Auto-Translate: {userPreferredLanguage} ↔ {agentLanguage}</span>
                </div>
            </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isHumanOverride = msg.isHumanOverride;

          // DISPLAY LOGIC:
          // If User: Always show msg.text (original) as main. Translated is hidden/secondary.
          // If Bot:
          //    If Translation ON && translatedText exists: Show translatedText as MAIN. Show original as Secondary.
          //    Else: Show msg.text as MAIN.
          
          let mainText = msg.text;
          let secondaryText = null;

          if (!isUser && isTranslationOn && msg.translatedText) {
              mainText = msg.translatedText; // Prioritize the translated text for the user to read
              secondaryText = msg.text; // Hide original below
          } else if (isUser && isTranslationOn && msg.translatedText) {
              // For user messages, we might want to show what we sent to the bot in the footer?
              // But usually user wants to see what they typed.
              mainText = msg.text;
          }

          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                
                <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-gray-200' : (isHumanOverride ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200')}`}>
                        {isUser ? <User size={16} className="text-gray-600"/> : (isHumanOverride ? <Fingerprint size={16}/> : <Bot size={16} className="text-gray-600"/>)}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        {msg.image && (
                            <img 
                                src={msg.image} 
                                alt="attachment" 
                                className={`max-w-[200px] rounded-xl border border-gray-200 shadow-sm ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'}`} 
                            />
                        )}

                        {mainText && (
                            <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                            isUser 
                                ? 'bg-black text-white rounded-tr-none' 
                                : (isHumanOverride ? 'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-tl-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none')
                            }`}>
                                {/* Primary Content (Translated or Original) */}
                                {renderMessageContent(mainText)}

                                {/* Secondary Content (Original Text if Translated is Main) */}
                                {secondaryText && (
                                    <div className={`mt-2 pt-2 border-t ${isUser ? 'border-gray-700 text-gray-300' : 'border-gray-200 text-indigo-600'} text-xs italic`}>
                                        <div className="flex items-center gap-1 mb-0.5 opacity-60">
                                            <Globe size={10} />
                                            <span className="text-[9px] uppercase font-bold">
                                                Original ({agentLanguage})
                                            </span>
                                        </div>
                                        {secondaryText}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Skill Activation Badge */}
                        {msg.activatedSkill && (
                           <div className="flex items-center gap-1.5 mt-1 bg-indigo-50 w-fit px-2 py-1 rounded-md border border-indigo-100 animate-in slide-in-from-left">
                               <Zap size={10} className="text-indigo-600 fill-indigo-600" />
                               <span className="text-[9px] font-bold text-indigo-700 uppercase">
                                   Skill Active: {msg.activatedSkill}
                               </span>
                           </div>
                        )}

                        <div className="flex justify-end">
                             <button 
                                onClick={async () => {
                                    // Speak what is visually displayed
                                    const voice = agent.voice || (isUser ? 'Kore' : 'Puck');
                                    const audio = await generateSpeech(mainText, voice);
                                    if(audio) playBase64Audio(audio);
                                }}
                                className="text-[10px] text-gray-400 hover:text-indigo-600 flex items-center gap-1"
                             >
                                 <Volume2 size={12} /> Play
                             </button>
                        </div>

                        {isHumanOverride && <span className="text-[9px] text-indigo-500 font-bold ml-1">{t('chat_human_connected')}</span>}
                    </div>
                </div>

                {msg.sources && msg.sources.length > 0 && (
                    <div className="ml-10 bg-white border border-gray-200 rounded-lg p-2 max-w-xs">
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                            <Link2 size={10} /> {t('chat_sources')}
                        </p>
                        <div className="flex flex-col gap-1">
                            {msg.sources.map((src, idx) => (
                                <a key={idx} href={src.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 truncate hover:underline block max-w-[200px]">
                                    {idx + 1}. {src.title}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
           <div className="flex justify-start">
             <div className="flex gap-2 max-w-[85%]">
               <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                 <Bot size={16} className="text-gray-600" />
               </div>
               <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
                 {isThinkingAgent ? (
                    <>
                         <BrainCircuit size={16} className="animate-pulse text-indigo-600" />
                         <span className="text-xs text-indigo-600 font-medium">Deep Thinking...</span>
                    </>
                 ) : (
                    <>
                        <Loader2 size={16} className="animate-spin text-gray-600" />
                        <span className="text-xs text-gray-400">{t('chat_thinking')}</span>
                    </>
                 )}
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 pb-8 relative">
        
        {showReward && (
            <div className="absolute top-[-30px] right-6 animate-in slide-in-from-bottom-5 fade-out duration-1000 z-50">
                <div className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Coins size={10} fill="black" /> +5
                </div>
            </div>
        )}

        {selectedImage && (
            <div className="flex items-center gap-2 mb-2 px-2 animate-in slide-in-from-bottom duration-200">
                <div className="relative group">
                    <img src={selectedImage} className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                    <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-1 -right-1 bg-gray-900 text-white rounded-full p-0.5 shadow-md"
                    >
                        <X size={12} />
                    </button>
                </div>
                <span className="text-xs text-gray-400 italic">Image attached</span>
            </div>
        )}

        <div className="flex items-center gap-2 bg-gray-100 px-2 py-2 rounded-full border border-transparent focus-within:border-gray-300 focus-within:bg-white transition-all">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ImageIcon size={20} />
          </button>
          
          <button 
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`p-2 rounded-full transition-all ${
                    isRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
                }`}
          >
             {isRecording ? <Radio size={20} /> : <Mic size={20} />}
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            accept="image/*" 
            className="hidden" 
          />
          
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.nativeEvent.isComposing) return;
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isRecording ? "Listening..." : t('chat_placeholder')}
            className="flex-1 bg-transparent border-none outline-none text-sm py-2"
          />
          <button 
            onClick={() => handleSend()}
            disabled={(!inputText.trim() && !selectedImage) || isLoading}
            className="p-2 bg-black text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
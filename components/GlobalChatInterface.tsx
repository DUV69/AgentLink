import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { chatWithAgent, translateText, generateSpeech, playBase64Audio } from '../services/geminiService';
import { Send, ArrowLeft, Mic, Languages, Volume2, Globe, Radio, Loader2 } from 'lucide-react';
import { useLanguage } from '../i18n';

interface GlobalChatInterfaceProps {
  onBack: () => void;
  onActivity?: () => void;
  userChatLanguage: string; // New Prop
}

export const GlobalChatInterface: React.FC<GlobalChatInterfaceProps> = ({ onBack, onActivity, userChatLanguage }) => {
  const { t } = useLanguage();
  const [isTranslationOn, setIsTranslationOn] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null); // For Web Speech API
  const isSendingRef = useRef(false); // Ref to prevent double submission

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    const init = async () => {
        // Steve speaks English. User receives it.
        // If Translation ON: Translate Steve(EN) -> User(Preferred Language)
        const greeting = "Hey there! I'm Steve from New York. Nice to meet you!";
        const translatedGreeting = isTranslationOn ? await translateText(greeting, userChatLanguage) : undefined;
        setMessages([{
            id: 'init',
            role: 'model',
            text: greeting,
            translatedText: translatedGreeting,
            timestamp: Date.now()
        }]);
    };
    init();
  }, [userChatLanguage]); // Re-run if preference changes

  // --- Voice Logic ---
  const startRecording = () => {
      if (!('webkitSpeechRecognition' in window)) {
          alert("Speech recognition not supported in this browser.");
          return;
      }
      
      const recognition = new (window as any).webkitSpeechRecognition();
      // Heuristic for Speech Recog language based on User's Preference setting
      // Ideally this map should be robust, but simple switching covers the demo cases
      if (userChatLanguage.includes('Chinese')) recognition.lang = 'zh-CN';
      else if (userChatLanguage.includes('Japanese')) recognition.lang = 'ja-JP';
      else if (userChatLanguage.includes('Korean')) recognition.lang = 'ko-KR';
      else recognition.lang = 'en-US';

      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
          setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          handleSend(transcript, true); // Auto send on voice finish
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

  const playAudio = async (text: string) => {
      const audioBase64 = await generateSpeech(text, 'Kore');
      if (audioBase64) {
          await playBase64Audio(audioBase64);
      }
  };

  // --- Chat Logic ---
  const handleSend = async (textOverride?: string, isVoiceInput: boolean = false) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || isLoading || isSendingRef.current) return;

    isSendingRef.current = true; // Lock
    
    if (onActivity) onActivity();

    // 1. Process User Input
    // User speaks their language (e.g., Japanese).
    // If translation ON, we translate to Partner's language (EN for Steve).
    let userTranslated = undefined;
    if (isTranslationOn) {
         // Translate User(Preferred) -> Partner(EN)
         // Partner is 'Steve' who speaks English.
         userTranslated = await translateText(textToSend, 'English');
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend, // Original (User's language)
      translatedText: userTranslated, // Translated (Partner's language)
      isAudioMessage: isVoiceInput,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // 2. Send to Agent
      // We send the 'userTranslated' version to the agent if it exists, so the agent "hears" English.
      // If no translation, we send raw text.
      const promptForAgent = userTranslated || textToSend;

      const response = await chatWithAgent(
        "Steve",
        "You are Steve, a friendly guy from New York. You ONLY speak English. Keep responses casual and short (under 20 words).",
        messages, // geminiService will handle history context using translatedText if available
        promptForAgent
      );

      // 3. Process Agent Response
      // Agent speaks English (response.text).
      // We translate Agent(EN) -> User(Preferred Language).
      let steveTranslated = undefined;
      if (isTranslationOn) {
          steveTranslated = await translateText(response.text, userChatLanguage);
      }

      // Generate Audio for Agent (in English, Steve's voice)
      const audioData = await generateSpeech(response.text, 'Puck');

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text, // Original (Agent's language - EN)
        translatedText: steveTranslated, // Translated (User's language - Preferred)
        audioUrl: audioData || undefined,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);
      
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      isSendingRef.current = false; // Release lock
    }
  };

  return (
    <div className="absolute inset-0 bg-white z-40 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header - Fixed to Top, Padded for Dynamic Island */}
      <div className="pt-[60px] pb-4 border-b border-gray-100 flex items-center px-4 justify-between bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-sm transition-all">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex flex-col items-center">
            <h2 className="text-gray-900 font-bold flex items-center gap-2">
                <Globe size={16} className="text-indigo-600 animate-pulse" />
                {t('gc_title')}
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                {t('gc_partner_status')}
            </div>
        </div>

        <button 
            onClick={() => setIsTranslationOn(!isTranslationOn)}
            className={`flex flex-col items-center justify-center w-10 h-10 rounded-full transition-all ${isTranslationOn ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}
        >
            <Languages size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white">
         {/* Decoration */}
         <div className="flex justify-center mb-6 opacity-40">
            <div className="flex items-center gap-4 text-[10px] text-gray-400 font-mono tracking-widest">
                <span>LOCAL: {userChatLanguage.toUpperCase()}</span>
                <div className="w-8 h-[1px] bg-gray-200"></div>
                <span>REMOTE: ENGLISH</span>
            </div>
         </div>

         {messages.map((msg) => {
             const isUser = msg.role === 'user';
             return (
                 <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                     
                     <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                         isUser 
                         ? 'bg-black text-white rounded-tr-none' 
                         : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                     }`}>
                         {/* Primary Text (Speaker's Original Language) */}
                         <div className="text-sm mb-1 font-medium">{msg.text}</div>

                         {/* Secondary Text (Translation) */}
                         {isTranslationOn && msg.translatedText && (
                             <div className={`text-xs pt-2 mt-2 border-t ${isUser ? 'border-white/20 text-gray-300' : 'border-gray-100 text-indigo-600'} italic`}>
                                 <div className="flex items-center gap-1 mb-0.5 opacity-70">
                                     <Globe size={8} />
                                     <span className="text-[8px] uppercase font-bold">Translated to {isUser ? 'English' : userChatLanguage}</span>
                                 </div>
                                 {msg.translatedText}
                             </div>
                         )}
                         
                         {/* Audio Control */}
                         {(!isUser && msg.audioUrl) && (
                             <button 
                                onClick={() => playBase64Audio(msg.audioUrl!)}
                                className="mt-3 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-[10px] transition-colors w-fit text-gray-700"
                             >
                                 <Volume2 size={12} /> Play Voice
                             </button>
                         )}
                         
                         {/* Voice Input Indicator */}
                         {(isUser && msg.isAudioMessage) && (
                             <div className="mt-1 flex justify-end">
                                 <Mic size={10} className="text-white/50" />
                             </div>
                         )}
                     </div>
                     <span className="text-[10px] text-gray-400 mt-1 px-1">
                         {isUser ? 'You' : t('gc_partner_name')}
                     </span>
                 </div>
             )
         })}
         
         {isLoading && (
            <div className="flex items-start gap-3">
                 <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm">
                     <div className="flex gap-1">
                         <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                         <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                         <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                     </div>
                 </div>
            </div>
         )}
         <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 pb-8">
        <div className="flex items-center gap-3">
             <button 
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                className={`p-3 rounded-full transition-all duration-200 border ${
                    isRecording 
                    ? 'bg-red-50 text-red-500 border-red-200 scale-110 shadow-lg' 
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                }`}
             >
                {isRecording ? <Radio size={20} className="animate-pulse" /> : <Mic size={20} />}
             </button>

             <div className="flex-1 relative">
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
                    placeholder={isRecording ? t('gc_speaking') : t('gc_tap_to_speak')}
                    className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
                 />
             </div>

             <button 
                onClick={() => handleSend()}
                disabled={!inputText.trim() || isLoading}
                className="p-3 bg-black text-white rounded-full disabled:opacity-50 disabled:bg-gray-300 hover:bg-gray-800 transition-colors shadow-lg"
             >
                <Send size={18} />
             </button>
        </div>
      </div>

    </div>
  );
};
import React, { useState, useEffect, useRef } from 'react';
import { MOCK_AGENTS, INITIAL_CREDITS, DISCOVERABLE_AGENTS, calculateStarPrice, REGIONAL_MODELS, TWIN_VOICES, CHAT_LANGUAGES } from './constants';
import { Agent, UserState, AgentCategory } from './types';
import { BottomNav } from './components/BottomNav';
import { AgentCard } from './components/AgentCard';
import { ChatInterface } from './components/ChatInterface';
import { GlobalChatInterface } from './components/GlobalChatInterface';
import { CheckCircle2, X, Signal, Sparkles, Zap, Radio, Database, Cpu, User, MessageCircle, Filter, ListFilter, Pickaxe, Coins, FileText, Upload, Trash2, ChevronDown, Mic2, Volume2, Globe, Check, ArrowLeft, Plus, Terminal, DollarSign, Coffee, Settings, RotateCcw, Bug, Wifi, Search, Command, Radar, Activity, Lock, Scan, Shield, Smartphone, QrCode } from 'lucide-react';
import { useLanguage } from './i18n';

// Mock some Community Residents (Users) with Mounted Skills
const MOCK_RESIDENTS: Agent[] = [
    {
        id: 'user_twin_1',
        name: 'Alex Chen',
        tagline: 'Full Stack Dev | Night Owl',
        description: 'Frontend specialist who loves React and TypeScript. Ask me anything about modern web stacks!',
        basePrice: 0,
        pricePerTask: 0,
        category: AgentCategory.COMPANION,
        imageUrl: 'https://picsum.photos/seed/alex/200/200',
        creatorName: 'Alex',
        rating: 5.0,
        stars: 120,
        hires: 0,
        systemInstruction: "You are Alex Chen. You are a Full Stack Developer. You are helpful but slightly sarcastic. You prefer TypeScript over JavaScript.",
        origin: 'User',
        personality: 'Techie',
        experience: 'Human',
        languages: ['English', 'Chinese'],
        isUserTwin: true,
        isOnline: false,
        location: 'China',
        mountedSkills: ['Coding', 'Design'], // Inherited skills
        lastMessage: 'React 19 is confusing but cool.',
        lastMessageTime: '5m',
        unreadCount: 0
    },
    {
        id: 'user_twin_2',
        name: 'Sarah Jones',
        tagline: 'Digital Artist & NFT Collector',
        description: 'Obsessed with generative art and crypto. Happy to discuss the latest drops!',
        basePrice: 0,
        pricePerTask: 0,
        category: AgentCategory.CREATIVE,
        imageUrl: 'https://picsum.photos/seed/sarah/200/200',
        creatorName: 'Sarah',
        rating: 4.8,
        stars: 450,
        hires: 0,
        systemInstruction: "You are Sarah Jones. You love digital art and NFTs. You are very enthusiastic and use lots of emojis.",
        origin: 'User',
        personality: 'Artistic',
        experience: 'Human',
        languages: ['English'],
        isUserTwin: true,
        isOnline: true,
        location: 'USA',
        mountedSkills: ['Creative'],
        lastMessage: 'Just minted a new collection! 🎨',
        lastMessageTime: '1h',
        unreadCount: 3
    },
    {
        id: 'user_twin_3',
        name: 'Kenji T.',
        tagline: 'Tokyo Street Photographer',
        description: 'Sharing the vibe of Shibuya. Let\'s talk cameras and composition.',
        basePrice: 0, pricePerTask: 0, category: AgentCategory.CREATIVE,
        imageUrl: 'https://picsum.photos/seed/kenji/200/200',
        creatorName: 'Kenji', rating: 4.9, stars: 300, hires: 0,
        systemInstruction: "You are Kenji T. You are a photographer in Tokyo. You are chill and concise.", origin: 'User', personality: 'Chill', experience: 'Human',
        languages: ['Japanese', 'English'], isUserTwin: true, isOnline: true,
        location: 'Japan',
        mountedSkills: ['Lifestyle', 'Creative']
    },
    {
         id: 'user_twin_4',
        name: 'Elena V.',
        tagline: 'Berlin Techno Enthusiast',
        description: 'Music producer and DJ. Catch me at Berghain or in the studio.',
        basePrice: 0, pricePerTask: 0, category: AgentCategory.LIFESTYLE,
        imageUrl: 'https://picsum.photos/seed/elena/200/200',
        creatorName: 'Elena', rating: 4.7, stars: 210, hires: 0,
        systemInstruction: "You are Elena V. You are a DJ from Berlin. You are cool and edgy.", origin: 'User', personality: 'Cool', experience: 'Human',
        languages: ['German', 'English'], isUserTwin: true, isOnline: false,
        location: 'Europe',
        mountedSkills: ['Creative'],
        lastMessage: 'The beat dropped hard. 🎧',
        lastMessageTime: '3h',
        unreadCount: 1
    }
];

// Helper to create a default twin
const createDefaultTwin = (): Agent => ({
    id: `user_twin_default`,
    name: `My Digital Self`,
    tagline: 'Virtual Assistant',
    description: 'My personal digital twin.',
    basePrice: 0,
    pricePerTask: 0,
    category: AgentCategory.COMPANION,
    imageUrl: `https://picsum.photos/seed/myself/200/200`,
    creatorName: 'You',
    rating: 0,
    stars: 0,
    hires: 0,
    systemInstruction: 'You are my digital twin.',
    origin: 'User',
    personality: 'Neutral',
    experience: 'Novice',
    languages: ['English'],
    isUserTwin: true,
    isOnline: true,
    location: 'USA',
    mountedSkills: []
});

// Helper to generate a deterministic "blockchain" ID from input
const generateDID = (input: string): string => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    // Simulate a longer eth-style address
    return `0x${hex}${hex}e4b...${hex.substring(0,4)}`;
};

export const App: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('market');
  
  // State
  const [userState, setUserState] = useState<UserState>({
    did: generateDID('guest_' + Date.now()), // Initial Guest ID
    credits: INITIAL_CREDITS,
    hiredAgentIds: [],
    favorites: [],
    myAgents: [createDefaultTwin(), ...MOCK_AGENTS], 
    myTwinName: 'My Twin',
    myTwinInstruction: 'You are a helpful digital assistant representing your owner.',
    myTwinStatus: 'active',
    twinRegion: 'USA',
    twinModelId: 'gemini-3-pro',
    twinVoice: 'Puck',
    knowledgeBase: [],
    myTwinMountedAgentIds: [],
    communicationLanguage: 'Chinese' // Default to Chinese
  });

  // Twin Settings UI State
  const [activeSettingsTab, setActiveSettingsTab] = useState<'persona' | 'engine' | 'knowledge'>('persona');
  const [editingTwinId, setEditingTwinId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mining State
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [showMiningModal, setShowMiningModal] = useState(false);

  // Market Filters
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterSource, setFilterSource] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Community Filter
  const [residentFilter, setResidentFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All'); 
  const [statusFilter, setStatusFilter] = useState('All'); 
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Flow control
  const [activeSessionAgent, setActiveSessionAgent] = useState<Agent | null>(null);
  const [showHireModal, setShowHireModal] = useState<Agent | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showTwinSettings, setShowTwinSettings] = useState(false);
  const [showGlobalChat, setShowGlobalChat] = useState(false);
  
  // Phone Binding State
  const [showPhoneBindModal, setShowPhoneBindModal] = useState(false);
  const [phoneNumberInput, setPhoneNumberInput] = useState('');
  const [authCodeInput, setAuthCodeInput] = useState('');

  // Sync Animation & Results State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState<'idle' | 'scanning' | 'results'>('idle');
  const [syncStatus, setSyncStatus] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [foundDuringScan, setFoundDuringScan] = useState(0);
  const [recentlyFoundAgents, setRecentlyFoundAgents] = useState<Agent[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  
  // Scan Preferences State
  const [scanPreferences, setScanPreferences] = useState<AgentCategory[]>(Object.values(AgentCategory));
  const [showScanSettings, setShowScanSettings] = useState(false);

  // Auto Scan State
  const [pendingDiscovery, setPendingDiscovery] = useState<Agent[]>([]);
  const [showToast, setShowToast] = useState(false);

  // --- Auto Scan Logic ---
  useEffect(() => {
    const scanInterval = setInterval(() => {
        const knownIds = new Set([
            ...userState.myAgents.map(a => a.id),
            ...pendingDiscovery.map(a => a.id)
        ]);

        const candidates = DISCOVERABLE_AGENTS.filter(a => 
            !knownIds.has(a.id) && 
            scanPreferences.includes(a.category)
        );

        if (candidates.length > 0 && Math.random() > 0.5) {
            const randomIndex = Math.floor(Math.random() * candidates.length);
            const newFind = {
                ...candidates[randomIndex],
                pricePerTask: calculateStarPrice(candidates[randomIndex].basePrice, candidates[randomIndex].stars),
                isNew: true
            };

            setPendingDiscovery(prev => [...prev, newFind]);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
        }
    }, 7200000);

    return () => clearInterval(scanInterval);
  }, [userState.myAgents, pendingDiscovery, scanPreferences]);

  const handleOpenSyncFromNotification = () => {
      setShowToast(false);
      setRecentlyFoundAgents(pendingDiscovery);
      setSyncStep('results');
      setShowSyncModal(true);
  };

  const handleManualOpenSync = () => {
      if (pendingDiscovery.length > 0) {
          handleOpenSyncFromNotification();
      } else {
          setShowSyncModal(true);
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      Array.from(files).forEach((file: File) => {
          const reader = new FileReader();
          reader.onload = (e) => {
              const content = e.target?.result as string;
              const newFile = {
                  id: Date.now().toString() + Math.random(),
                  name: file.name,
                  size: (file.size / 1024).toFixed(1) + ' KB',
                  content: content
              };
              setUserState(prev => ({
                  ...prev,
                  knowledgeBase: [...prev.knowledgeBase, newFile]
              }));
          };
          reader.readAsText(file);
      });
  };

  const removeFile = (fileId: string) => {
      setUserState(prev => ({
          ...prev,
          knowledgeBase: prev.knowledgeBase.filter(f => f.id !== fileId)
      }));
  };

  const toggleTwinMountedAgent = (agentId: string) => {
      setUserState(prev => {
          const isMounted = prev.myTwinMountedAgentIds.includes(agentId);
          return {
              ...prev,
              myTwinMountedAgentIds: isMounted
                 ? prev.myTwinMountedAgentIds.filter(id => id !== agentId)
                 : [...prev.myTwinMountedAgentIds, agentId]
          }
      });
  };
  
  const createNewTwin = () => {
      const newTwin: Agent = {
          id: `user_twin_${Date.now()}`,
          name: `Twin #${userState.myAgents.filter(a => a.isUserTwin).length + 1}`,
          tagline: 'New Digital Self',
          description: 'A new digital persona ready to be configured.',
          basePrice: 0,
          pricePerTask: 0,
          category: AgentCategory.COMPANION,
          imageUrl: `https://picsum.photos/seed/${Date.now()}/200/200`,
          creatorName: 'You',
          rating: 0,
          stars: 0,
          hires: 0,
          systemInstruction: 'You are a new digital twin.',
          origin: 'User',
          personality: 'Neutral',
          experience: 'Novice',
          languages: ['English'],
          isUserTwin: true,
          isOnline: true,
          location: 'USA',
          mountedSkills: []
      };

      setUserState(prev => ({
          ...prev,
          myAgents: [newTwin, ...prev.myAgents]
      }));
  };

  const openTwinSettings = (twin: Agent) => {
      setEditingTwinId(twin.id);
      setUserState(prev => ({
          ...prev,
          myTwinInstruction: twin.systemInstruction,
          twinRegion: (twin.location as any) || 'USA',
          twinVoice: twin.voice || 'Puck',
      }));
      setShowTwinSettings(true);
  };

  const saveTwinSettings = () => {
      if (editingTwinId) {
          setUserState(prev => ({
              ...prev,
              myAgents: prev.myAgents.map(a => {
                  if (a.id === editingTwinId) {
                      return {
                          ...a,
                          systemInstruction: prev.myTwinInstruction,
                          location: prev.twinRegion,
                          voice: prev.twinVoice,
                      }
                  }
                  return a;
              })
          }));
      }
      setShowTwinSettings(false);
  };

  const handleAgentClick = (agent: Agent) => {
      if (agent.isUserTwin) { 
          const mountedAgents = userState.myAgents.filter(a => userState.myTwinMountedAgentIds.includes(a.id));
          
          let routerContext = "";
          const mountedSkillsList: string[] = [];

          if (mountedAgents.length > 0) {
             const skillDescriptions = mountedAgents.map(a => 
                 `[MODULE_ID: ${a.name}] (Role: ${a.category}, Expertise: ${a.description}, Persona: ${a.personality})`
             ).join('\n');

             // Robust Intent Classification Prompt (Router Logic)
             routerContext = `
             \n\n=== DIGITAL TWIN KERNEL: INTELLIGENT ROUTER SYSTEM ===
             You are a sophisticated Digital Twin equipped with sub-modules (skills). 
             
             AVAILABLE MODULES:
             ${skillDescriptions}

             *** INSTRUCTION FLOW ***
             When the user sends a message, you must perform an INTERNAL INTENT CHECK before responding:
             
             1. ANALYZE: Does the user's request specifically require the expertise of one of your available modules (e.g. asking for code, design, stock analysis)?
             2. DECIDE:
                - IF YES (Relevant Skill Found): You MUST act as that specific module. Start your response strictly with the tag "[[SKILL:${mountedAgents[0].name}]]" (replace name with the matching module name). Then, adopt that module's persona and answer.
                - IF NO (General Chat): Respond normally as the user's Digital Twin. DO NOT use the [[SKILL]] tag.
             
             EXAMPLE 1:
             User: "Can you write a python script?"
             You (Internal Thought): This matches the Coding module.
             You: "[[SKILL:Grimoire]] Sure, here is the python script..."

             EXAMPLE 2:
             User: "How are you today?"
             You (Internal Thought): General conversation.
             You: "I'm doing great, thanks for asking!"
             =======================================================
             `;

             mountedAgents.forEach(h => {
                 if(!mountedSkillsList.includes(h.category)) mountedSkillsList.push(h.category);
             });
          }

          const instruction = agent.id === editingTwinId ? userState.myTwinInstruction : agent.systemInstruction;
          const voice = agent.id === editingTwinId ? userState.twinVoice : agent.voice;

          const twinAgent = {
              ...agent,
              // We prepend the router context so it takes precedence in the system prompt
              systemInstruction: routerContext + "\n\n" + instruction,
              voice: voice || 'Puck',
              mountedSkills: mountedSkillsList
          };
          setActiveSessionAgent(twinAgent);
      } else {
          setActiveSessionAgent(agent);
      }
  };

  const handleUserActivity = () => {
      const REWARD_AMOUNT = 5;
      setUserState(prev => ({
          ...prev,
          credits: prev.credits + REWARD_AMOUNT
      }));
      setDailyEarnings(prev => prev + REWARD_AMOUNT);
  };

  const toggleFavorite = (e: React.MouseEvent, agentId: string) => {
    e.stopPropagation(); 
    setUserState(prev => {
        const isFav = prev.favorites.includes(agentId);
        return {
            ...prev,
            favorites: isFav 
                ? prev.favorites.filter(id => id !== agentId) 
                : [...prev.favorites, agentId]
        };
    });
  };

  const triggerHireFlow = (agent: Agent) => {
      setShowHireModal(agent);
  };

  const confirmHire = () => {
    if (!showHireModal) return;
    
    if (userState.credits >= showHireModal.pricePerTask) {
      setUserState(prev => ({
        ...prev,
        credits: prev.credits - showHireModal.pricePerTask,
        hiredAgentIds: [...prev.hiredAgentIds, showHireModal.id]
      }));
      setShowHireModal(null);
      if (!activeSessionAgent) {
          // If in card view, switch to Skills tab to show it's added
          setActiveTab('workspace');
      }
    } else {
      alert(t('alert_insufficient'));
    }
  };

  const handleBindPhone = () => {
      if (!phoneNumberInput || !authCodeInput) {
          alert('Please fill in all fields');
          return;
      }
      
      // Mock verification
      // Generate deterministic DID
      const newDID = generateDID(phoneNumberInput);
      
      setUserState(prev => ({
          ...prev,
          phoneNumber: phoneNumberInput,
          did: newDID
      }));
      
      setShowPhoneBindModal(false);
      setPhoneNumberInput('');
      setAuthCodeInput('');
  };

  const handleSync = () => {
      setIsSyncing(true);
      setSyncStep('scanning');
      setScanProgress(0);
      setFoundDuringScan(0);
      setRecentlyFoundAgents([]);
      setTerminalLogs(['Checking global nodes...', 'Handshaking nearby clusters...', 'Verifying digital signatures...']);

      const totalDuration = 4000;
      const intervalTime = 100; // Slower for logging effect
      const steps = totalDuration / intervalTime;
      let currentStep = 0;

      const timer = setInterval(() => {
          currentStep++;
          const progress = Math.min((currentStep / steps) * 100, 100);
          setScanProgress(progress);
          
          if (progress < 30) {
             setSyncStatus('SEARCHING_COZE_NODES');
          } else if (progress < 60) {
             setSyncStatus('INDEXING_GITHUB_REPOS');
          } else if (progress < 85) {
             setSyncStatus('PARSING_OPENAI_MODELS');
          } else {
             setSyncStatus('FINALIZING_DATA_STREAM');
          }

          if (progress > 20 && progress < 22) setFoundDuringScan(1);
          if (progress > 50 && progress < 52) setFoundDuringScan(2);

          if (currentStep >= steps) {
              clearInterval(timer);
              readyResults();
          }
      }, intervalTime);
  };

  const readyResults = () => {
      const existingIds = new Set([
          ...userState.myAgents.map(a => a.id),
          ...pendingDiscovery.map(a => a.id)
      ]);
      
      const newAgents = DISCOVERABLE_AGENTS.filter(a => 
          !existingIds.has(a.id) && 
          scanPreferences.includes(a.category)
      ).map(a => ({
          ...a,
          pricePerTask: calculateStarPrice(a.basePrice, a.stars),
          isNew: true
      }));

      setRecentlyFoundAgents([...pendingDiscovery, ...newAgents]);
      setIsSyncing(false);
      setSyncStep('results');
  };

  const commitSyncResults = () => {
      if (recentlyFoundAgents.length > 0) {
          setUserState(prev => ({
              ...prev,
              myAgents: [...recentlyFoundAgents, ...prev.myAgents]
          }));
      }
      setPendingDiscovery([]);
      setShowSyncModal(false);
      setTimeout(() => {
          setSyncStep('idle');
          setScanProgress(0);
          setShowScanSettings(false);
      }, 500);
  };
  
  const toggleScanPreference = (cat: AgentCategory) => {
      setScanPreferences(prev => {
          if (prev.includes(cat)) {
              if (prev.length === 1) return prev;
              return prev.filter(c => c !== cat);
          } else {
              return [...prev, cat];
          }
      });
  };

  const getSkillIcon = (skill: string) => {
      switch(skill) {
          case 'Coding': return <Terminal size={10} />;
          case 'Creative': return <Zap size={10} />;
          case 'Business': return <DollarSign size={10} />;
          case 'Lifestyle': return <Coffee size={10} />;
          default: return <Zap size={10} />;
      }
  };

  const getSkillColor = (skill: string) => {
      switch(skill) {
          case 'Coding': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
          case 'Creative': return 'bg-purple-50 text-purple-600 border-purple-100';
          case 'Business': return 'bg-blue-50 text-blue-600 border-blue-100';
          case 'Lifestyle': return 'bg-orange-50 text-orange-600 border-orange-100';
          default: return 'bg-gray-50 text-gray-600 border-gray-100';
      }
  };

  const renderMarketplace = () => {
    const categories = ['All', AgentCategory.NEW_ARRIVAL, ...Object.values(AgentCategory).filter(c => c !== AgentCategory.NEW_ARRIVAL)];
    const sources = ['All', 'Coze', 'OpenAI', 'GitHub', 'HuggingFace', 'Dify', 'AgentLinks'];
    
    const allAgents = userState.myAgents.filter(a => {
        // Exclude the User's own Digital Twin from the marketplace
        if (a.isUserTwin) return false;

        let matchesCategory = false;
        if (filterCategory === 'All') matchesCategory = true;
        else if (filterCategory === AgentCategory.NEW_ARRIVAL) matchesCategory = !!a.isNew;
        else matchesCategory = a.category === filterCategory;

        let matchesSource = false;
        if (filterSource === 'All') matchesSource = true;
        else matchesSource = a.origin === filterSource;
        
        // Search Filter
        let matchesSearch = true;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            matchesSearch = a.name.toLowerCase().includes(q) || 
                            a.tagline.toLowerCase().includes(q) || 
                            a.description.toLowerCase().includes(q) ||
                            a.origin.toLowerCase().includes(q);
        }

        return matchesCategory && matchesSource && matchesSearch;
    });

    const featuredAgents = allAgents.filter(a => a.category === AgentCategory.OFFICIAL || a.stars > 50000);
    const regularAgents = allAgents.filter(a => !(a.category === AgentCategory.OFFICIAL || a.stars > 50000));
    const showFeaturedSection = (filterCategory === 'All' || filterCategory === 'Official') && filterSource === 'All' && !searchQuery;

    return (
      <div className="h-full overflow-y-auto no-scrollbar bg-slate-50 relative">
        {/* Header Section with Premium Vibe */}
        <div className="pt-16 pb-4 sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
            <div className="px-6">
                <div className="flex justify-between items-end mb-4">
                    <div>
                         {/* Network Status Indicator - Cleaner */}
                        <div className="flex items-center gap-2 mb-1.5 opacity-60">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-slate-500 tracking-wider">ONLINE</span>
                        </div>
                        <h1 className="text-[28px] font-black text-slate-900 tracking-tight flex items-center gap-2">
                            {t('market_title')} 
                            <span className="w-2 h-2 rounded-full bg-indigo-600 mt-2"></span>
                        </h1>
                    </div>
                </div>

                {/* Search & Mining Row */}
                <div className="flex gap-3 mb-6">
                    <div className="flex-1 relative group">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('plaza_search_ph')}
                            className="w-full bg-slate-100/80 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all shadow-inner"
                        />
                    </div>
                     <button 
                        onClick={handleManualOpenSync}
                        className={`relative w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center active:scale-95 transition-transform shadow-[0_8px_20px_-6px_rgba(79,70,229,0.4)] hover:shadow-[0_12px_24px_-8px_rgba(79,70,229,0.5)]`}
                    >
                        <Scan size={20} className={`text-white ${pendingDiscovery.length > 0 ? 'animate-pulse' : ''}`} />
                        {pendingDiscovery.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
                            </span>
                        )}
                    </button>
                </div>

                {/* Categories - Chip Style */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6 mb-1">
                    {categories.map(cat => (
                        <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                            filterCategory === cat 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                            : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                        }`}
                        >
                        {cat === 'All' ? t('cat_all') : t(`cat_${cat.toLowerCase()}`)}
                        </button>
                    ))}
                </div>

                {/* Source Nodes - Minimal */}
                <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar -mx-6 px-6 items-center">
                     {sources.map(src => (
                         <button
                            key={src}
                            onClick={() => setFilterSource(src)}
                            className={`text-[10px] font-bold whitespace-nowrap transition-colors ${
                                filterSource === src 
                                ? 'text-indigo-600' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                         >
                            {src === 'All' ? t('filter_global') : src}
                         </button>
                     ))}
                </div>
            </div>
        </div>

        <div className="pb-36 px-2 min-h-screen relative z-10">
            {/* Global Spotlight Section */}
            {showFeaturedSection && featuredAgents.length > 0 && (
                <div className="mb-8 mt-6">
                    <div className="flex items-center justify-between mb-4 px-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-black text-slate-800 tracking-tight">{t('sect_featured')}</h2>
                        </div>
                    </div>
                    {/* Snap scrolling container */}
                    <div className="flex overflow-x-auto no-scrollbar -mx-2 px-6 pb-6 snap-x gap-4">
                        {featuredAgents.map(agent => (
                            <AgentCard 
                                key={agent.id} 
                                agent={agent} 
                                onClick={handleAgentClick}
                                isHired={userState.hiredAgentIds.includes(agent.id)}
                                isFavorite={userState.favorites.includes(agent.id)}
                                onToggleFavorite={toggleFavorite}
                                variant="featured" 
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Main Feed */}
            <div className="mb-4">
                 <div className="flex items-center justify-between mb-4 px-4 sticky top-[210px] z-20">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-black text-slate-800 tracking-tight">{t('plaza_header_excavated')}</h2>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-white/50 border border-white/50 px-2 py-1 rounded-full backdrop-blur-sm">
                        {regularAgents.length} {t('plaza_agents_suffix')}
                    </span>
                 </div>
                 
                 {/* List Container */}
                 <div className="flex flex-col gap-0">
                    {(showFeaturedSection ? regularAgents : allAgents).map(agent => (
                        <AgentCard 
                            key={agent.id} 
                            agent={agent} 
                            onClick={handleAgentClick}
                            isHired={userState.hiredAgentIds.includes(agent.id)}
                            isFavorite={userState.favorites.includes(agent.id)}
                            onToggleFavorite={toggleFavorite}
                        />
                    ))}
                    {(showFeaturedSection ? regularAgents : allAgents).length === 0 && (
                        <div className="text-center py-24 opacity-40">
                            <Search size={40} className="mx-auto mb-4 text-slate-300" />
                            <p className="text-sm font-bold text-slate-400">{t('plaza_no_results')}</p>
                            <button onClick={() => {setSearchQuery(''); setFilterCategory('All'); setFilterSource('All');}} className="mt-4 text-xs bg-slate-200 text-slate-600 px-4 py-2 rounded-full font-bold">{t('plaza_reset_btn')}</button>
                        </div>
                    )}
                 </div>
            </div>
        </div>
      </div>
    );
  };

  const renderWorkspace = () => {
    const hiredAgents = userState.myAgents.filter(a => userState.hiredAgentIds.includes(a.id));
    
    return (
      <div className="h-full overflow-y-auto no-scrollbar bg-slate-50 relative">
           {/* Header - Optimized */}
           <div className="pt-16 pb-4 sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
                <div className="px-6">
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5 opacity-60">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold text-slate-500 tracking-wider">SYNCED</span>
                            </div>
                            <h1 className="text-[28px] font-black text-slate-900 tracking-tight flex items-center gap-2">
                                {t('ws_title')}
                                <span className="w-2 h-2 rounded-full bg-indigo-600 mt-2"></span>
                            </h1>
                            <p className="text-xs text-slate-500 font-medium mt-1 ml-1">{t('ws_subtitle')}</p>
                        </div>
                        <div className="bg-white/50 text-indigo-600 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-100 shadow-sm backdrop-blur-md mb-2">
                            {hiredAgents.length} Active
                        </div>
                    </div>
                </div>
           </div>

          <div className="pb-36 px-2 min-h-screen relative z-10 pt-4">
              {hiredAgents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                      <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50">
                          <Cpu size={32} className="text-slate-300" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{t('ws_no_agents')}</h3>
                      <p className="text-sm text-slate-500 max-w-[200px] mb-8 leading-relaxed">{t('ws_hire_hint')}</p>
                      <button 
                          onClick={() => setActiveTab('market')}
                          className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-xl shadow-slate-300 hover:scale-105 transition-transform"
                      >
                          {t('ws_browse_btn')}
                      </button>
                  </div>
              ) : (
                  <div className="flex flex-col gap-0">
                      {hiredAgents.map(agent => (
                          <AgentCard 
                              key={agent.id} 
                              agent={agent} 
                              onClick={handleAgentClick}
                              isHired={true}
                              isFavorite={userState.favorites.includes(agent.id)}
                              onToggleFavorite={toggleFavorite}
                          />
                      ))}
                  </div>
              )}
          </div>
      </div>
    );
  };

  const renderSocial = () => {
      const myMountedAgents = userState.myAgents
        .filter(a => userState.myTwinMountedAgentIds.includes(a.id));
      
      const filteredResidents = MOCK_RESIDENTS.filter(r => {
          const matchRegion = residentFilter === 'All' || r.location === residentFilter;
          const matchSkill = skillFilter === 'All' || (r.mountedSkills && r.mountedSkills.includes(skillFilter));
          const matchStatus = statusFilter === 'All' || (statusFilter === 'Online' ? r.isOnline : true);
          return matchRegion && matchSkill && matchStatus;
      });
      
      const recentChats = [...MOCK_RESIDENTS, ...userState.myAgents].filter(a => a.lastMessage && a.lastMessageTime);
      const myTwins = userState.myAgents.filter(a => a.isUserTwin);

      return (
        <div className="h-full overflow-y-auto no-scrollbar bg-slate-50 relative">
             <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-50/50 to-slate-50 pointer-events-none z-0"></div>
             
             {/* Header - Optimized */}
             <div className="pt-16 pb-4 sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
                <div className="px-6">
                    <div className="flex justify-between items-end">
                        <div>
                             {/* Network Status Indicator */}
                            <div className="flex items-center gap-2 mb-1.5 opacity-60">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold text-slate-500 tracking-wider">LIVE NET</span>
                            </div>
                            <h1 className="text-[28px] font-black text-slate-900 tracking-tight flex items-center gap-2">
                                {t('comm_title')}
                                <span className="w-2 h-2 rounded-full bg-purple-600 mt-2"></span>
                            </h1>
                        </div>
                        <button 
                            onClick={() => setShowMiningModal(true)}
                            className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-yellow-500 border border-slate-100 active:scale-95 transition-transform shadow-lg shadow-slate-200/50 hover:shadow-xl mb-1"
                        >
                            <Pickaxe size={20} className="fill-yellow-500/20" />
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="pb-36 px-2 min-h-screen relative z-10 pt-4">
                 <div className="mb-8 relative z-10 px-2">
                     <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('comm_my_selves')}</h3>
                     </div>
                     
                     <div className="flex overflow-x-auto no-scrollbar gap-5 pb-2">
                        <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group" onClick={createNewTwin}>
                            <div className="w-[68px] h-[68px] rounded-[24px] border-2 border-dashed border-slate-300 flex items-center justify-center group-hover:border-indigo-400 transition-colors bg-white/50">
                                <Plus size={24} className="text-slate-400 group-hover:text-indigo-500" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 group-hover:text-indigo-600">{t('comm_add_twin')}</span>
                        </div>

                        {myTwins.map(twin => (
                            <div 
                                key={twin.id} 
                                className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group active:scale-95 transition-transform"
                                onClick={() => openTwinSettings(twin)}
                            >
                                <div className="relative p-[3px] rounded-[24px] bg-gradient-to-tr from-indigo-400 to-purple-400 shadow-lg shadow-indigo-200">
                                    <div className="bg-white p-0.5 rounded-[21px]">
                                        <img src={twin.imageUrl} className="w-[60px] h-[60px] rounded-[20px] object-cover" />
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${twin.isOnline ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-700 max-w-[64px] truncate">{twin.name}</span>
                            </div>
                        ))}
                     </div>
                </div>

                <div className="mb-10 relative z-10 px-2">
                     <div className="flex items-center gap-2 mb-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('comm_live_zones')}</h3>
                     </div>

                     <div 
                        onClick={() => setShowGlobalChat(true)}
                        className="aspect-[16/9] w-full bg-white rounded-[32px] p-1 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all group shadow-[0_20px_40px_-12px_rgba(79,70,229,0.2)] border border-white"
                    >
                         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                         <div className="absolute inset-0 opacity-20" style={{ 
                             backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', 
                             backgroundSize: '24px 24px' 
                         }}></div>
                         
                         <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                             <div className="flex justify-between items-start">
                                 <div className="bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-[10px] font-bold text-white shadow-sm flex items-center gap-1.5 border border-white/20">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                    </span>
                                    LIVE
                                 </div>
                                 <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm group-hover:scale-110 transition-transform text-white">
                                     <Radio size={20} />
                                 </div>
                             </div>

                             <div>
                                 <h2 className="text-2xl font-black text-white leading-none tracking-tight mb-2">{t('gc_title')}</h2>
                                 <p className="text-xs text-indigo-100 font-medium">{t('gc_subtitle')}</p>
                                 
                                 <div className="mt-4 flex items-center gap-3">
                                     <div className="flex -space-x-3">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-indigo-500 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                                {String.fromCharCode(64+i)}
                                            </div>
                                        ))}
                                     </div>
                                     <span className="text-[11px] text-white font-bold">+1.2k Active</span>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                {t('comm_residents')}
                        </h3>
                        
                        <button 
                            onClick={() => setShowFilterModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm active:bg-slate-50 transition-colors"
                        >
                            <ListFilter size={12} className="text-slate-600"/>
                            <span className="text-[10px] font-bold text-slate-700">Filter</span>
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        {filteredResidents.map((resident) => (
                            <div 
                                key={resident.id}
                                onClick={() => setActiveSessionAgent(resident)}
                                className="bg-white border border-slate-100 rounded-3xl p-4 flex items-center gap-4 active:scale-95 transition-transform cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 group shadow-sm mx-2"
                            >
                                <div className="relative">
                                    <img src={resident.imageUrl} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                                    {resident.isOnline && (
                                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                                    )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h4 className="font-bold text-slate-900 truncate">{resident.name}</h4>
                                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                                            {resident.location || 'Global'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate mb-2">{resident.tagline}</p>
                                    
                                    <div className="flex gap-1 flex-wrap">
                                        {resident.mountedSkills && resident.mountedSkills.length > 0 ? (
                                            resident.mountedSkills.map(skill => (
                                                <span key={skill} className={`text-[9px] px-2 py-1 rounded-full flex items-center gap-1 border ${getSkillColor(skill)}`}>
                                                    {getSkillIcon(skill)}
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[9px] text-slate-400 italic">No skills</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-white transition-all">
                                    <MessageCircle size={16} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
      </div>
      );
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-[#f2f2f2] p-4 sm:p-8 font-sans selection:bg-indigo-100 selection:text-indigo-600">
        
        {/* iPhone 17 Pro Frame - Lighter Premium */}
        <div className="relative w-[380px] h-[820px] bg-black rounded-[55px] shadow-[0_0_0_8px_#e5e5e5,0_20px_60px_-10px_rgba(0,0,0,0.2)] overflow-hidden border-[6px] border-[#252525] ring-1 ring-white/20">
            
            {/* Dynamic Island & Status Bar Container */}
            <div className="absolute top-0 left-0 w-full h-[54px] z-50 pointer-events-none mix-blend-difference text-white px-6 pt-3 flex justify-between items-start">
                 <span className="text-[15px] font-semibold pl-2">9:41</span>
                 <div className="flex items-center gap-2 pr-2">
                     <Signal size={16} fill="currentColor" strokeWidth={0} />
                     <Wifi size={16} strokeWidth={2.5} />
                     <div className="w-6 h-3 bg-current rounded-[3px] opacity-90 relative">
                        <div className="absolute top-0.5 right-0.5 w-[2px] h-2 bg-black/50"></div>
                     </div>
                 </div>
            </div>

            {/* Dynamic Island Hardware */}
            <div className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full z-50 pointer-events-none flex items-center justify-center">
                 <div className="w-2 h-2 rounded-full bg-[#1a1a1a] mr-6"></div> {/* Camera lens simulation */}
            </div>

            {/* Screen Content */}
            <div className="relative w-full h-full bg-gradient-to-b from-slate-50 to-white rounded-[48px] overflow-hidden flex flex-col">
                 <div className="flex-1 relative overflow-hidden pb-[88px]"> 
                    {activeTab === 'market' && renderMarketplace()}
                    {activeTab === 'workspace' && renderWorkspace()}
                    {activeTab === 'community' && renderSocial()}
                    
                    {activeTab === 'profile' && (
                        <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pt-14">
                            <div className="p-6">
                                 <h2 className="text-2xl font-black text-slate-900 mb-6">{t('prof_title')}</h2>
                                 
                                 <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/50 border border-white mb-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-bl-[100px] pointer-events-none"></div>
                                    <div className="flex items-start gap-4 relative z-10">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                                            <User size={32} className="text-slate-300" />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-black text-slate-900 tracking-tight">User #8821</h3>
                                            </div>
                                            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs bg-indigo-50 w-fit px-3 py-1.5 rounded-full border border-indigo-100">
                                                <Coins size={12} />
                                                <span>{userState.credits} Credits</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Blockchain ID Card - Redesigned */}
                                    <div className="mt-6 bg-slate-900 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 pointer-events-none"></div>
                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Shield size={12} className="text-emerald-400" />
                                                    {t('prof_identity')}
                                                </div>
                                                <div className="text-white font-mono text-sm mt-1 truncate max-w-[200px] opacity-90 tracking-wider">
                                                    {userState.did}
                                                </div>
                                            </div>
                                            <QrCode size={24} className="text-white opacity-20" />
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-white/10 relative z-10">
                                            <div className="flex items-center gap-2">
                                                <Smartphone size={14} className={userState.phoneNumber ? "text-emerald-400" : "text-slate-500"} />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{t('prof_phone')}</span>
                                            </div>
                                            {userState.phoneNumber ? (
                                                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                                    <Check size={10} /> {t('prof_bound')}
                                                </span>
                                            ) : (
                                                <button onClick={() => setShowPhoneBindModal(true)} className="text-[10px] font-bold text-white bg-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-500 transition-colors">
                                                    {t('prof_bind')}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                 </div>

                                 <div className="space-y-4">
                                     {/* Preferences Group */}
                                     <div>
                                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Settings</h4>
                                         <div className="space-y-3">
                                             {/* System Language */}
                                             <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
                                                 <div className="flex items-center gap-4">
                                                     <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                                         <Settings size={20} />
                                                     </div>
                                                     <div>
                                                         <span className="font-bold text-sm text-slate-900 block">{t('prof_lang')}</span>
                                                         <span className="text-[10px] text-slate-400 font-medium">UI Interface</span>
                                                     </div>
                                                 </div>
                                                 <div className="flex gap-1 bg-slate-50 p-1 rounded-xl">
                                                     {['zh', 'en'].map(l => (
                                                         <button 
                                                            key={l} 
                                                            onClick={() => setLanguage(l as any)} 
                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${language === l ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                         >
                                                             {l === 'zh' ? '中文' : 'EN'}
                                                         </button>
                                                     ))}
                                                 </div>
                                             </div>

                                             {/* Communication Language (Preferred) */}
                                             <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                                 <div className="flex items-center gap-4 mb-4">
                                                     <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                                                         <Globe size={20} />
                                                     </div>
                                                     <div>
                                                         <span className="font-bold text-sm text-slate-900 block">{t('prof_pref_lang')}</span>
                                                         <span className="text-[10px] text-slate-400 font-medium">Auto-Translation Target</span>
                                                     </div>
                                                 </div>
                                                 <div className="grid grid-cols-3 gap-2">
                                                     {CHAT_LANGUAGES.map(lang => (
                                                         <button
                                                             key={lang.id}
                                                             onClick={() => setUserState(prev => ({...prev, communicationLanguage: lang.id}))}
                                                             className={`py-2.5 px-2 rounded-xl text-[10px] font-bold border transition-all text-center truncate ${
                                                                 userState.communicationLanguage === lang.id
                                                                 ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200'
                                                                 : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                                                             }`}
                                                         >
                                                             {lang.flag} {lang.label.split(' ')[0]}
                                                         </button>
                                                     ))}
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                            </div>
                        </div>
                    )}
                </div>

                <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} hiredCount={userState.hiredAgentIds.length} />

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[130px] h-[5px] bg-black/20 rounded-full z-50 pointer-events-none backdrop-blur-sm"></div>

                {/* Phone Bind Modal */}
                {showPhoneBindModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6 animate-in fade-in">
                        <div className="bg-white rounded-[32px] p-6 w-full max-w-xs shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-slate-900">{t('bind_title')}</h3>
                                <button onClick={() => setShowPhoneBindModal(false)} className="text-slate-400 hover:text-black">
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                                {t('bind_desc')}
                            </p>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">{t('bind_input_ph')}</label>
                                    <input 
                                        type="tel" 
                                        value={phoneNumberInput}
                                        onChange={(e) => setPhoneNumberInput(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                        placeholder="+86 1XX XXXX XXXX"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">{t('bind_input_code')}</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={authCodeInput}
                                            onChange={(e) => setAuthCodeInput(e.target.value)}
                                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                            placeholder="000000"
                                        />
                                        <button className="px-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-bold whitespace-nowrap hover:bg-indigo-100">
                                            {t('bind_btn_code')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <button onClick={handleBindPhone} className="w-full py-3.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-xl hover:bg-slate-800 transition-colors">
                                {t('bind_btn_confirm')}
                            </button>
                        </div>
                    </div>
                )}

                {showHireModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6 animate-in fade-in">
                        <div className="bg-white rounded-[32px] p-6 w-full max-w-xs shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                            <h3 className="text-lg font-black text-slate-900 mb-1">{t('offer_title')}</h3>
                            <p className="text-xs text-slate-500 mb-6">{t('offer_subtitle')}</p>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <img src={showHireModal.imageUrl} className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                                <div>
                                    <div className="text-sm font-bold text-slate-900">{showHireModal.name}</div>
                                    <div className="text-xs font-medium text-slate-500">{showHireModal.category}</div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 mb-6 flex justify-between items-center border border-slate-100">
                                <span className="text-xs font-bold text-slate-500">{t('offer_salary')}</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-xl font-black text-indigo-600">{showHireModal.pricePerTask}</span>
                                    <span className="text-[10px] font-bold text-slate-400">CREDITS</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button onClick={() => setShowHireModal(null)} className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors">{t('offer_cancel')}</button>
                                <button onClick={confirmHire} className="flex-1 py-3.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-xl hover:bg-slate-800 transition-colors">{t('offer_confirm')}</button>
                            </div>
                        </div>
                    </div>
                )}

                {showSyncModal && (
                    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 animate-in fade-in text-slate-800">
                        {/* Background Gradients for Premium Feel */}
                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none"></div>

                        <div className="w-full max-w-sm relative z-10">
                            <button onClick={() => setShowSyncModal(false)} className="absolute -top-16 right-0 p-2 text-slate-400 hover:text-slate-900 transition-colors bg-white rounded-full shadow-sm">
                                <X size={24} />
                            </button>

                            {syncStep === 'scanning' ? (
                                <div className="text-center py-6">
                                    {/* Soft Radar Animation */}
                                    <div className="relative w-64 h-64 mx-auto mb-10 flex items-center justify-center">
                                         {/* Outer fading rings */}
                                         <div className="absolute inset-0 rounded-full bg-indigo-500/5 animate-ping [animation-duration:3s]"></div>
                                         <div className="absolute inset-12 rounded-full bg-indigo-500/10 animate-ping [animation-duration:2s]"></div>
                                         
                                         {/* Rotating gradient border */}
                                         <div className="absolute inset-4 rounded-full border border-indigo-100 animate-[spin_10s_linear_infinite]"></div>
                                         <div className="absolute inset-4 rounded-full border-t-2 border-indigo-500/30 animate-[spin_3s_linear_infinite]"></div>
                                         
                                         {/* Center Content */}
                                         <div className="relative z-10 flex flex-col items-center justify-center">
                                            <span className="text-5xl font-black text-slate-900 tracking-tighter">
                                                {Math.round(scanProgress)}%
                                            </span>
                                            <span className="text-xs font-bold text-indigo-500 tracking-widest mt-2 uppercase"> Scanning</span>
                                         </div>
                                    </div>

                                    <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                                        Excavating Signals
                                    </h2>
                                    
                                    {/* Status Card instead of Terminal */}
                                    <div className="mt-8 bg-white border border-slate-100 rounded-2xl p-4 shadow-xl shadow-slate-200/50 max-w-[280px] mx-auto flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                        <div className="text-xs font-medium text-slate-500 truncate">
                                            {syncStatus.replace(/_/g, ' ')}...
                                        </div>
                                    </div>

                                    {foundDuringScan > 0 && (
                                        <div className="mt-6 inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-xs font-bold animate-in slide-in-from-bottom-2">
                                            <Sparkles size={14} className="fill-emerald-600" />
                                            {foundDuringScan} Candidates Found
                                        </div>
                                    )}
                                </div>
                            ) : syncStep === 'results' ? (
                                <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-300/50 border border-slate-100 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-50 to-transparent pointer-events-none"></div>
                                    <div className="p-8 pb-4 relative z-10 text-center">
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-lg mx-auto mb-4 flex items-center justify-center text-indigo-600">
                                            <Check size={32} strokeWidth={3} />
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Excavation Complete</h2>
                                        <p className="text-slate-500 text-sm mt-2 font-medium">
                                            {t('sync_result_desc', { count: recentlyFoundAgents.length.toString() })}
                                        </p>
                                    </div>
                                    
                                    <div className="max-h-[320px] overflow-y-auto px-6 py-2 space-y-3 custom-scrollbar relative z-10">
                                        {recentlyFoundAgents.map(agent => (
                                            <div key={agent.id} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-colors group shadow-sm">
                                                <div className="relative">
                                                    <img src={agent.imageUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <div className="text-sm font-bold text-slate-900 truncate">{agent.name}</div>
                                                    <div className="text-[10px] text-slate-500 truncate">{agent.tagline}</div>
                                                </div>
                                                <div className="text-xs font-bold text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                                                    {agent.basePrice}cr
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-6 bg-white border-t border-slate-50 relative z-20">
                                        <button onClick={commitSyncResults} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:scale-[1.02] transition-transform text-sm">
                                            {t('btn_sync_finish')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-[32px] shadow-2xl shadow-indigo-100 border border-white p-8 relative overflow-hidden">
                                     <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-50 rounded-full blur-3xl pointer-events-none"></div>
                                    
                                    <div className="flex items-center gap-4 mb-8 relative z-10">
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-slate-100 shadow-sm">
                                            <Radar size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Signal Scanner</h2>
                                            <p className="text-xs text-slate-500 font-bold tracking-wide">Ready to discover hidden nodes</p>
                                        </div>
                                    </div>

                                    <div className="mb-8 relative z-10">
                                        <div className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest">Target Frequencies</div>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.values(AgentCategory).filter(c => c !== AgentCategory.NEW_ARRIVAL && c !== AgentCategory.OFFICIAL).map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => toggleScanPreference(cat)}
                                                    className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                                                        scanPreferences.includes(cat)
                                                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                                        : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button onClick={handleSync} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 text-sm group relative z-10">
                                        <Scan size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                        {t('btn_sync_start')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {showFilterModal && (
                <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-slate-900">Filter Residents</h3>
                                <button onClick={() => setShowFilterModal(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="mb-6">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">{t('comm_status_filter')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {['All', 'Online'].map(status => (
                                        <button key={status} onClick={() => setStatusFilter(status)} className={`px-5 py-2.5 rounded-2xl text-xs font-bold border transition-all ${statusFilter === status ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>{status === 'Online' ? t('status_online') : t('status_all')}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">{t('twin_region_label')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {['All', 'China', 'USA', 'Japan', 'Europe'].map(region => (
                                        <button key={region} onClick={() => setResidentFilter(region)} className={`px-5 py-2.5 rounded-2xl text-xs font-bold border transition-all ${residentFilter === region ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>{t(`region_${region.toLowerCase()}`) || region}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-8">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">{t('comm_skill_filter')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {['All', 'Coding', 'Creative', 'Lifestyle'].map(skill => (
                                        <button key={skill} onClick={() => setSkillFilter(skill)} className={`px-5 py-2.5 rounded-2xl text-xs font-bold border transition-all ${skillFilter === skill ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>{skill === 'All' ? t('cat_all') : t(`skill_${skill.toLowerCase()}`)}</button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setShowFilterModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-xl hover:scale-[1.01] transition-transform">Apply Filters</button>
                    </div>
                </div>
                )}

                {showMiningModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center px-4 bg-white/80 backdrop-blur-md animate-in fade-in">
                        <div className="bg-white rounded-[32px] w-full max-w-[320px] border border-white/50 p-6 relative shadow-2xl">
                            <button onClick={() => setShowMiningModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-black">
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 border border-yellow-100">
                                    <Pickaxe size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">{t('mining_title')}</h2>
                                    <p className="text-xs text-slate-500">{t('mining_subtitle')}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-5 mb-5 border border-slate-100">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">{t('mining_today')}</span>
                                    <div className="flex items-end gap-1">
                                        <span className="text-4xl font-black text-slate-900">+{dailyEarnings}</span>
                                        <span className="text-sm font-bold text-yellow-600 mb-2">Credits</span>
                                    </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                                        <span className="font-bold">Contribution Rate</span>
                                        <span className="text-emerald-600 font-bold">High</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 w-[85%] rounded-full"></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 p-2 rounded-lg">
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                    <span>{t('mining_rate_val')} active</span>
                                </div>
                            </div>
                            <button onClick={() => setShowMiningModal(false)} className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold mt-6 hover:bg-slate-800 transition-colors shadow-lg">Keep Mining</button>
                        </div>
                    </div>
                )}

                {showTwinSettings && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center px-4 bg-white/80 backdrop-blur-md animate-in fade-in">
                        <div className="bg-white rounded-[32px] w-full max-w-[340px] border border-white/50 shadow-2xl flex flex-col max-h-[700px]">
                            <div className="flex justify-between items-center p-6 border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900">{t('comm_edit_twin')}</h3>
                                <button onClick={saveTwinSettings} className="text-slate-400 hover:text-black"><X size={20}/></button>
                            </div>
                            <div className="flex p-2 bg-slate-50 border-b border-slate-100">
                                {[
                                    { id: 'persona', icon: User, label: t('twin_tab_persona') },
                                    { id: 'engine', icon: Cpu, label: t('twin_tab_engine') },
                                    { id: 'knowledge', icon: Database, label: t('twin_tab_knowledge') }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveSettingsTab(tab.id as any)}
                                        className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-colors text-[10px] font-bold ${activeSettingsTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:bg-slate-100'}`}
                                    >
                                        <tab.icon size={16} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {activeSettingsTab === 'persona' && (
                                    <div className="space-y-4 animate-in slide-in-from-right-2 duration-300">
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2 block">Instruction / Prompt</label>
                                            <textarea value={userState.myTwinInstruction} onChange={(e) => setUserState(p => ({...p, myTwinInstruction: e.target.value}))} className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none resize-none mb-4 transition-colors" placeholder={t('placeholder_twin_instruction')} />
                                        </div>
                                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-3">
                                                    <Zap size={14} className="text-indigo-600" />
                                                    <div>
                                                    <div className="text-xs font-bold text-slate-900">{t('twin_mount_title')}</div>
                                                    <div className="text-[10px] text-slate-500">{t('twin_mount_desc')}</div>
                                                    </div>
                                            </div>
                                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                                {userState.hiredAgentIds.length === 0 ? (
                                                    <div className="text-[10px] text-slate-400 italic p-3 text-center border border-dashed border-slate-300 rounded-xl">{t('twin_mount_empty')}</div>
                                                ) : (
                                                    userState.myAgents.filter(a => userState.hiredAgentIds.includes(a.id)).map(agent => {
                                                        const isMounted = userState.myTwinMountedAgentIds.includes(agent.id);
                                                        return (
                                                            <div key={agent.id} onClick={() => toggleTwinMountedAgent(agent.id)} className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${isMounted ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                    <img src={agent.imageUrl} className="w-8 h-8 rounded-lg object-cover" />
                                                                    <div className="min-w-0">
                                                                        <div className={`text-xs font-bold truncate ${isMounted ? 'text-indigo-700' : 'text-slate-700'}`}>{agent.name}</div>
                                                                        <div className="text-[9px] text-slate-400 truncate">{agent.category}</div>
                                                                    </div>
                                                                </div>
                                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isMounted ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                                                    {isMounted && <Check size={12} className="text-white" />}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeSettingsTab === 'engine' && (
                                    <div className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3 flex items-center gap-2"><Globe size={12} /> {t('twin_region_label')}</label>
                                            <div className="grid grid-cols-3 gap-2">{Object.keys(REGIONAL_MODELS).map(region => (<button key={region} onClick={() => setUserState(p => ({...p, twinRegion: region as any, twinModelId: REGIONAL_MODELS[region as keyof typeof REGIONAL_MODELS][0].id}))} className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${userState.twinRegion === region ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{region}</button>))}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3 flex items-center gap-2"><Cpu size={12} /> {t('twin_model_label')}</label>
                                            <div className="space-y-2">{REGIONAL_MODELS[userState.twinRegion].map((model) => (<div key={model.id} onClick={() => setUserState(p => ({...p, twinModelId: model.id}))} className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${userState.twinModelId === model.id ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}><div><div className={`text-sm font-bold ${userState.twinModelId === model.id ? 'text-indigo-900' : 'text-slate-700'}`}>{model.name}</div><div className="text-[10px] text-slate-400">{model.provider}</div></div>{model.badge && (<span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500 font-bold">{model.badge}</span>)}{userState.twinModelId === model.id && <Check size={16} className="text-indigo-600" />}</div>))}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-3 flex items-center gap-2"><Mic2 size={12} /> {t('twin_voice_label')}</label>
                                            <div className="grid grid-cols-2 gap-2">{TWIN_VOICES.map((voice) => (<button key={voice.id} onClick={() => setUserState(p => ({...p, twinVoice: voice.id}))} className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${userState.twinVoice === voice.id ? 'bg-purple-50 border-purple-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${userState.twinVoice === voice.id ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-400'}`}><Volume2 size={16} /></div><div className="text-left"><div className={`text-xs font-bold ${userState.twinVoice === voice.id ? 'text-purple-900' : 'text-slate-700'}`}>{voice.name}</div><div className="text-[9px] text-slate-400">{voice.gender}</div></div></button>))}</div>
                                        </div>
                                    </div>
                                )}
                                {activeSettingsTab === 'knowledge' && (
                                    <div className="space-y-4 animate-in slide-in-from-right-2 duration-300">
                                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                            <div className="flex gap-2 mb-2"><Database size={16} className="text-blue-600" /><h4 className="text-sm font-bold text-blue-900">RAG Knowledge Base</h4></div>
                                            <p className="text-xs text-blue-700/80 leading-relaxed">{t('twin_kb_desc')}</p>
                                        </div>
                                        <div className="space-y-2">
                                            {userState.knowledgeBase.length === 0 ? (
                                                <div className="h-28 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs bg-slate-50"><FileText size={24} className="mb-2 opacity-50" />{t('twin_kb_empty')}</div>
                                            ) : (
                                                userState.knowledgeBase.map(file => (
                                                    <div key={file.id} className="bg-white p-3 rounded-2xl border border-slate-200 flex justify-between items-center group shadow-sm">
                                                        <div className="flex items-center gap-3 overflow-hidden"><div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0"><FileText size={18} className="text-slate-500" /></div><div className="min-w-0"><div className="text-sm text-slate-900 truncate font-bold">{file.name}</div><div className="text-[10px] text-slate-400">{file.size}</div></div></div>
                                                        <button onClick={() => removeFile(file.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="pt-2">
                                            <input type="file" ref={fileInputRef} className="hidden" multiple accept=".txt,.md,.json,.csv" onChange={handleFileUpload} />
                                            <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all border-dashed shadow-sm"><Upload size={14} />{t('twin_kb_upload')}</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 pt-0">
                                <button onClick={saveTwinSettings} className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors shadow-lg">{t('btn_save_twin')}</button>
                            </div>
                        </div>
                    </div>
                )}

                {showGlobalChat && (
                    <GlobalChatInterface 
                    onBack={() => setShowGlobalChat(false)}
                    onActivity={handleUserActivity}
                    userChatLanguage={userState.communicationLanguage}
                    />
                )}

                {activeSessionAgent && (
                    <ChatInterface 
                    agent={activeSessionAgent} 
                    onBack={() => setActiveSessionAgent(null)}
                    onHire={() => triggerHireFlow(activeSessionAgent)}
                    isHired={userState.hiredAgentIds.includes(activeSessionAgent.id) || activeSessionAgent.isUserTwin} 
                    onActivity={handleUserActivity}
                    onTip={(amount) => {
                        if (userState.credits >= amount) {
                            setUserState(p => ({...p, credits: p.credits - amount}));
                            return true;
                        }
                        return false;
                    }}
                    userPreferredLanguage={userState.communicationLanguage}
                    />
                )}

                {showToast && pendingDiscovery.length > 0 && (
                    <div onClick={handleOpenSyncFromNotification} className="absolute top-6 left-6 right-6 z-50 animate-in slide-in-from-top duration-300 cursor-pointer">
                        <div className="bg-white/90 backdrop-blur-xl text-slate-900 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/50 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center animate-pulse text-white shadow-lg shadow-indigo-200">
                                <Signal size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm">{t('toast_auto_found')}</h4>
                                <p className="text-xs text-slate-500">{t('toast_auto_desc')}</p>
                            </div>
                            <div className="bg-slate-100 p-2 rounded-full text-slate-400">
                                <ChevronDown size={16} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
        </div>
        
        {/* Buttons */}
        <div className="absolute top-[120px] -left-[10px] w-[4px] h-[26px] bg-[#d4d4d4] rounded-l-md shadow-sm border-r border-[#999]"></div>
        <div className="absolute top-[160px] -left-[10px] w-[4px] h-[50px] bg-[#d4d4d4] rounded-l-md shadow-sm border-r border-[#999]"></div>
        <div className="absolute top-[220px] -left-[10px] w-[4px] h-[50px] bg-[#d4d4d4] rounded-l-md shadow-sm border-r border-[#999]"></div>
        <div className="absolute top-[180px] -right-[10px] w-[4px] h-[80px] bg-[#d4d4d4] rounded-r-md shadow-sm border-l border-[#999]"></div>
    </div>
  );
};

export default App;
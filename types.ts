
export enum AgentCategory {
  NEW_ARRIVAL = 'New Arrivals', // New category requested
  OFFICIAL = 'Official',
  CREATIVE = 'Creative',
  CODING = 'Coding',
  LIFESTYLE = 'Lifestyle',
  BUSINESS = 'Business',
  COMPANION = 'Companion'
}

export type PlatformOrigin = 'AgentLink' | 'Coze' | 'Dify' | 'OpenAI' | 'GitHub' | 'HuggingFace' | 'Other' | 'User';

export interface Agent {
  id: string;
  name: string;
  tagline: string;
  description: string;
  basePrice: number; 
  pricePerTask: number;
  category: AgentCategory;
  imageUrl: string;
  creatorName: string;
  rating: number;
  stars: number;
  hires: number;
  systemInstruction: string;
  origin: PlatformOrigin;
  personality: string; 
  experience: string; 
  languages: string[];
  
  // New Pro Features
  isOfficial?: boolean; // Shows verified badge
  thinkingBudget?: number; // If > 0, enables Gemini 3.0 Thinking mode
  
  // Dynamic State
  isNew?: boolean; // Newly discovered via sync
  
  // Community Features
  isUserTwin?: boolean; // Is this a digital twin of a real user?
  isOnline?: boolean; // Is the real user currently online?
  location?: string; // User location/region
  voice?: string; // Preferred TTS voice
  mountedSkills?: string[]; // Skills inherited from hired team members
  
  // Recent Chat Features
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  translatedText?: string; // For cross-border chat
  audioUrl?: string; // For TTS playback
  isAudioMessage?: boolean; // If the original input was voice
  image?: string; // Base64 string for user uploads
  sources?: { title: string; uri: string }[]; // For search grounding
  timestamp: number;
  isHumanOverride?: boolean; // Mark message as sent by human in takeover mode
  activatedSkill?: string; // Name of the skill/agent that handled this message
}

export interface KnowledgeFile {
  id: string;
  name: string;
  size: string;
  content?: string; // Mock content
}

export interface UserState {
  // Identity
  did: string; // Decentralized ID (Blockchain Address)
  phoneNumber?: string; // Bound phone number
  
  credits: number;
  hiredAgentIds: string[];
  favorites: string[];
  myAgents: Agent[];
  
  // Digital Twin Settings
  myTwinName: string;
  myTwinInstruction: string;
  myTwinStatus: 'active' | 'busy' | 'manual';
  
  // Advanced Twin Config
  twinRegion: 'China' | 'USA' | 'Europe';
  twinModelId: string;
  twinVoice: string; // New Voice setting
  knowledgeBase: KnowledgeFile[];
  myTwinMountedAgentIds: string[]; // IDs of hired agents mounted to the twin
  
  // Global Settings
  communicationLanguage: string; // Preferred language for translations (e.g., 'Japanese', 'Chinese', 'English')
}
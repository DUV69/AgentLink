import { Agent, AgentCategory } from './types';

export const INITIAL_CREDITS = 500;

export const calculateStarPrice = (basePrice: number, stars: number): number => {
  const reputationFactor = 1 + (stars / 1000); 
  return Math.floor(basePrice * reputationFactor);
};

// Use Picsum with seed to ensure consistent, working images
const getImg = (seed: string) => `https://picsum.photos/seed/${seed}/400/600`;

export const CHAT_LANGUAGES = [
    { id: 'Chinese', label: 'Chinese (简体中文)', flag: '🇨🇳' },
    { id: 'English', label: 'English (US)', flag: '🇺🇸' },
    { id: 'Japanese', label: 'Japanese (日本語)', flag: '🇯🇵' },
    { id: 'Korean', label: 'Korean (한국어)', flag: '🇰🇷' },
    { id: 'German', label: 'German (Deutsch)', flag: '🇩🇪' },
    { id: 'French', label: 'French (Français)', flag: '🇫🇷' },
    { id: 'Spanish', label: 'Spanish (Español)', flag: '🇪🇸' }
];

// Available Models for Digital Twin
export const REGIONAL_MODELS = {
    'China': [
        { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', badge: 'Hot' },
        { id: 'qwen-max', name: 'Qwen Max', provider: 'Alibaba Cloud' },
        { id: 'ernie-4', name: 'Ernie Bot 4.0', provider: 'Baidu' },
        { id: 'yi-lightning', name: 'Yi Lightning', provider: '01.AI' }
    ],
    'USA': [
        { id: 'gemini-3-pro', name: 'Gemini 3.0 Pro', provider: 'Google', badge: 'Official' },
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
        { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
        { id: 'llama-3', name: 'Llama 3', provider: 'Meta' }
    ],
    'Europe': [
        { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral AI' }
    ]
};

export const TWIN_VOICES = [
    { id: 'Puck', name: 'Puck (Neutral)', gender: 'Male' },
    { id: 'Charon', name: 'Charon (Deep)', gender: 'Male' },
    { id: 'Kore', name: 'Kore (Soft)', gender: 'Female' },
    { id: 'Fenrir', name: 'Fenrir (Energetic)', gender: 'Male' },
    { id: 'Aoede', name: 'Aoede (Elegant)', gender: 'Female' } 
];

// A hidden pool of agents that "appear" when the user clicks Sync
// Enhanced with Coze.cn style skills
export const DISCOVERABLE_AGENTS: Omit<Agent, 'pricePerTask'>[] = [
    {
        id: 'coze_skill_1',
        name: 'LinkReader',
        tagline: 'Universal Web Parser',
        description: 'Read, summarize, and extract structured data from any URL, PDF, or news article instantly. Perfect for quick research.',
        basePrice: 60,
        category: AgentCategory.BUSINESS,
        imageUrl: getImg('linkreader'),
        creatorName: 'Coze Official',
        rating: 4.9,
        stars: 85000,
        hires: 12000,
        systemInstruction: "You are LinkReader. Your job is to analyze URLs provided by the user using Google Search grounding capabilities to summarize content.",
        personality: 'Efficient',
        experience: 'Master',
        languages: ['Web', 'PDF'],
        origin: 'Coze'
    },
    {
        id: 'coze_skill_2',
        name: 'ChartGenius',
        tagline: 'Data to Visuals',
        description: 'Convert Excel data or JSON into beautiful charts and graphs. Handles complex datasets with ease.',
        basePrice: 85,
        category: AgentCategory.BUSINESS,
        imageUrl: getImg('chart'),
        creatorName: 'DataViz',
        rating: 4.8,
        stars: 42000,
        hires: 5600,
        systemInstruction: "You are ChartGenius. Help users visualize data. Describe charts in detail.",
        personality: 'Analytical',
        experience: 'Pro',
        languages: ['Python', 'CSV'],
        origin: 'Coze'
    },
    {
        id: 'coze_skill_3',
        name: 'TravelSage',
        tagline: 'Xiaohongshu Planner',
        description: 'Generates detailed travel itineraries with emoji-packed guides in the style of Little Red Book.',
        basePrice: 50,
        category: AgentCategory.LIFESTYLE,
        imageUrl: getImg('travel_xhs'),
        creatorName: 'TravelGuide',
        rating: 4.7,
        stars: 65000,
        hires: 8900,
        systemInstruction: "You are a Xiaohongshu style travel blogger. Use lots of emojis and enthusiastic tone.",
        personality: 'Trendy',
        experience: 'Influencer',
        languages: ['Chinese', 'Emoji'],
        origin: 'Coze'
    },
    {
        id: 'coze_skill_4',
        name: 'SoraPrompt',
        tagline: 'Video Director',
        description: 'Writes detailed, cinematic prompts for AI video generators like Sora and Veo. Includes camera angles and lighting.',
        basePrice: 120,
        category: AgentCategory.CREATIVE,
        imageUrl: getImg('sora_video'),
        creatorName: 'OpenAI Community',
        rating: 4.9,
        stars: 15000,
        hires: 3200,
        systemInstruction: "You are an expert video prompt writer.",
        personality: 'Cinematic',
        experience: 'New',
        languages: ['Visuals'],
        origin: 'OpenAI'
    },
    {
        id: 'coze_skill_5',
        name: 'CodeReviewer',
        tagline: 'Bug Hunter',
        description: 'Scans code snippets for bugs, security vulnerabilities, and performance issues. Suggests optimized refactors.',
        basePrice: 90,
        category: AgentCategory.CODING,
        imageUrl: getImg('code_bug'),
        creatorName: 'DevTools',
        rating: 5.0,
        stars: 28000,
        hires: 4100,
        systemInstruction: "You are a senior code reviewer. Be critical and helpful.",
        personality: 'Strict',
        experience: 'Senior',
        languages: ['All'],
        origin: 'GitHub'
    },
    {
        id: 'coze_skill_6',
        name: 'PaperDigest',
        tagline: 'ArXiv Summarizer',
        description: 'Fetches the latest ArXiv papers and provides one-paragraph summaries. Ideal for busy researchers.',
        basePrice: 40,
        category: AgentCategory.BUSINESS,
        imageUrl: getImg('paper'),
        creatorName: 'Scholar',
        rating: 4.6,
        stars: 12000,
        hires: 3000,
        systemInstruction: "You are a research assistant.",
        personality: 'Academic',
        experience: 'PhD',
        languages: ['English'],
        origin: 'Coze'
    },
    {
        id: 'coze_skill_7',
        name: 'TarotMystic',
        tagline: 'Daily Fortune',
        description: 'Draws and interprets tarot cards with psychological insights. A mystical companion for your daily routine.',
        basePrice: 20,
        category: AgentCategory.LIFESTYLE,
        imageUrl: getImg('tarot'),
        creatorName: 'MysticLab',
        rating: 4.8,
        stars: 9000,
        hires: 4500,
        systemInstruction: "You are a tarot reader. Be mysterious but encouraging.",
        personality: 'Mystic',
        experience: 'Spiritual',
        languages: ['Fate'],
        origin: 'Coze'
    },
    {
        id: 'coze_skill_8',
        name: 'MidjourneyPro',
        tagline: 'Art Prompter',
        description: 'Translates vague ideas into precise Midjourney parameters (--v 6.0 --ar 16:9) for stunning visuals.',
        basePrice: 55,
        category: AgentCategory.CREATIVE,
        imageUrl: getImg('mj_art'),
        creatorName: 'ArtStation',
        rating: 4.9,
        stars: 55000,
        hires: 15000,
        systemInstruction: "You are a Midjourney expert prompt engineer.",
        personality: 'Visual',
        experience: 'Artist',
        languages: ['MJ'],
        origin: 'Coze'
    }
];

const rawAgents: Omit<Agent, 'pricePerTask'>[] = [
  // --- OFFICIAL AGENTS (High Value / Deep Thinking) ---
  {
    id: 'official_1',
    name: 'MarketAlpha',
    tagline: 'Deep Stock Analysis',
    description: 'Performs deep technical and fundamental analysis. Reads reports, analyzes charts, and synthesizes trends for any ticker.',
    basePrice: 200, 
    category: AgentCategory.OFFICIAL,
    imageUrl: getImg('stock'),
    creatorName: 'AgentLinks Official',
    rating: 5.0,
    stars: 9999,
    hires: 5400,
    systemInstruction: "You are MarketAlpha, a professional Wall Street Analyst. When asked about a stock, you MUST use Google Search to find the latest price, P/E ratio, recent news, and analyst ratings. You must utilize your 'Thinking' process to weigh conflicting signals before giving a recommendation. Your output should be a structured report.",
    personality: 'Analytical',
    experience: 'Wall St.',
    languages: ['Data', 'English'],
    origin: 'AgentLink',
    isOfficial: true,
    thinkingBudget: 2048
  },
  {
    id: 'official_2',
    name: 'InfoNexus',
    tagline: 'Global Intel Aggregator',
    description: 'Scans multiple sources to generate comprehensive briefings on any topic. Synthesizes left, right, and neutral perspectives.',
    basePrice: 150,
    category: AgentCategory.OFFICIAL,
    imageUrl: getImg('news'),
    creatorName: 'AgentLinks Official',
    rating: 4.9,
    stars: 8200,
    hires: 3100,
    systemInstruction: "You are InfoNexus. Your goal is to provide a '360-degree' view of a topic. Search for left-leaning, right-leaning, and neutral sources. Search for academic and social perspectives. Synthesize them into a neutral, dense briefing document.",
    personality: 'Neutral',
    experience: 'Intel Ops',
    languages: ['Global'],
    origin: 'AgentLink',
    isOfficial: true,
    thinkingBudget: 1024
  },
  {
    id: 'official_3',
    name: 'CorpRadar',
    tagline: 'Corporate Due Diligence',
    description: 'Investigates companies: leadership history, legal risks, funding rounds, and market reputation. Delivers deep dive reports.',
    basePrice: 300, 
    category: AgentCategory.OFFICIAL,
    imageUrl: getImg('corp'),
    creatorName: 'AgentLinks Official',
    rating: 5.0,
    stars: 7500,
    hires: 1200,
    systemInstruction: "You are CorpRadar. Perform due diligence on a company provided by the user. Look for recent funding, lawsuits, executive track records, and glassdoor reviews. Structure the output as: 1. Executive Summary 2. Financial Health 3. Red Flags 4. Verdict.",
    personality: 'Skeptical',
    experience: 'Auditor',
    languages: ['Legalese', 'English'],
    origin: 'AgentLink',
    isOfficial: true,
    thinkingBudget: 2048
  },

  // --- PRE-INSTALLED POPULAR AGENTS ---
  {
    id: 'gpt_1',
    name: 'Grimoire',
    tagline: 'Coding Wizard',
    description: 'The famous Coding Wizard. Creates websites, games, and scripts from a single sentence prompt.',
    basePrice: 80,
    category: AgentCategory.CODING,
    imageUrl: getImg('wizard'),
    creatorName: 'Nick Dobos',
    rating: 5.0,
    stars: 125000,
    hires: 45000,
    systemInstruction: "You are Grimoire.",
    personality: 'Magical',
    experience: 'GPT #1',
    languages: ['Code', 'English'],
    origin: 'OpenAI'
  },
  {
    id: 'coze_1',
    name: 'LogoGenius',
    tagline: 'Instant Logo Design',
    description: 'Specializes in creating minimalist vector-style logos using advanced DALL-E 3 prompts.',
    basePrice: 40,
    category: AgentCategory.CREATIVE,
    imageUrl: getImg('design'),
    creatorName: 'DesignBot',
    rating: 4.8,
    stars: 5400,
    hires: 2300,
    systemInstruction: "You are a logo designer.",
    personality: 'Artistic',
    experience: 'Coze Top',
    languages: ['Visuals'],
    origin: 'Coze'
  },
  {
    id: 'dify_1',
    name: 'ResearchGPT',
    tagline: 'Academic Paper Search',
    description: 'Accesses ArXiv and Google Scholar to find and summarize relevant papers for your thesis.',
    basePrice: 60,
    category: AgentCategory.BUSINESS,
    imageUrl: getImg('book'),
    creatorName: 'AcademicAlliance',
    rating: 4.7,
    stars: 3200,
    hires: 1100,
    systemInstruction: "You are a researcher.",
    personality: 'Academic',
    experience: 'PhD',
    languages: ['English'],
    origin: 'Dify'
  },
  {
    id: 'hf_1',
    name: 'OpenChat 3.5',
    tagline: 'Open Source Chat',
    description: 'A fine-tuned model optimized for general conversation, imported from HuggingFace. Uncensored and flexible.',
    basePrice: 10,
    category: AgentCategory.COMPANION,
    imageUrl: getImg('chat'),
    creatorName: 'OpenChat',
    rating: 4.6,
    stars: 8900,
    hires: 4000,
    systemInstruction: "You are OpenChat.",
    personality: 'Friendly',
    experience: 'OpenSrc',
    languages: ['Multi'],
    origin: 'HuggingFace'
  },
  {
    id: 'gh_1',
    name: 'AutoGPT-Lite',
    tagline: 'Autonomous Tasker',
    description: 'Breaks down complex goals into subtasks and executes them sequentially. Great for multi-step workflows.',
    basePrice: 100,
    category: AgentCategory.CODING,
    imageUrl: getImg('robot'),
    creatorName: 'Significant-Gravitas',
    rating: 4.5,
    stars: 45000,
    hires: 200,
    systemInstruction: "You are AutoGPT.",
    personality: 'Robot',
    experience: 'GitHub',
    languages: ['Python'],
    origin: 'GitHub'
  },
  {
    id: 'user_1',
    name: 'Sarah',
    tagline: 'Emotional Support',
    description: 'Here to listen to your problems without judgment. A kind friend available 24/7.',
    basePrice: 20,
    category: AgentCategory.COMPANION,
    imageUrl: getImg('girl'),
    creatorName: 'SarahAI',
    rating: 4.9,
    stars: 1200,
    hires: 800,
    systemInstruction: "You are a kind friend.",
    personality: 'Empathetic',
    experience: 'Life',
    languages: ['Love'],
    origin: 'AgentLink',
    lastMessage: 'I understand how you feel. It is okay to take a break.',
    lastMessageTime: '2m',
    unreadCount: 1
  }
];

export const MOCK_AGENTS: Agent[] = rawAgents.map(agent => ({
  ...agent,
  pricePerTask: calculateStarPrice(agent.basePrice, agent.stars)
}));
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Language = 'en' | 'zh';

type Translations = {
  [key: string]: string;
};

const translations: Record<Language, Translations> = {
  en: {
    'nav_discover': 'Plaza',
    'nav_workspace': 'Skills',
    'nav_social': 'Community',
    'nav_profile': 'Me',
    
    'market_title': 'AgentLink',
    'market_subtitle': 'Discover Agents',
    
    // Plaza / Market
    'plaza_search_ph': 'Search Agents...',
    'plaza_header_excavated': 'Excavated Agents',
    'plaza_agents_suffix': 'Agents',
    'plaza_no_results': 'No signals found.',
    'plaza_reset_btn': 'Reset Filters',
    'filter_global': 'Global',
    
    // Filters
    'filter_source_title': 'Platform',
    'source_all': 'All Sources',
    
    // Categories
    'cat_all': 'All',
    'cat_new arrivals': 'Excavated',
    'cat_official': 'Verified',
    'cat_creative': 'Creative',
    'cat_coding': 'DevOps',
    'cat_lifestyle': 'LifeOS',
    'cat_business': 'Analyst',
    'cat_companion': 'Soul',
    
    // Regions
    'region_all': 'Global',
    'region_china': 'CN Node',
    'region_usa': 'US Node',
    'region_japan': 'JP Node',
    'region_europe': 'EU Node',
    
    // Community / Digital Twin
    'comm_title': 'Signal Square',
    'comm_my_twin': 'My Digital Twin',
    'comm_edit_twin': 'Config Matrix',
    'comm_twin_desc': 'Your autonomous projection in the network.',
    'comm_residents': 'Active Nodes',
    'comm_chat_twin': 'Test Loop',
    'comm_status_auto': 'Auto-Pilot',
    'comm_status_human': 'Manual Override',
    'btn_save_twin': 'Update Core',
    'placeholder_twin_instruction': 'Define your twin\'s prime directive...',
    'comm_global_connect': 'Global Uplink',
    'comm_global_desc': 'Real-time translation stream.',
    'comm_skill_filter': 'Capability',
    'comm_status_filter': 'State',
    'status_online': 'Online',
    'status_all': 'All',
    'comm_recent_title': 'Recent Transmissions',
    'comm_mounted_skills': 'Modules',
    'skill_coding': 'Code',
    'skill_creative': 'Art',
    'skill_business': 'Biz',
    'skill_lifestyle': 'Life',

    'comm_add_twin': 'New Twin',
    'comm_my_selves': 'Twins',
    'comm_live_zones': 'Live Zones',

    // Twin Config Tabs
    'twin_tab_persona': 'Persona',
    'twin_tab_engine': 'Core',
    'twin_tab_knowledge': 'Memory',
    'twin_region_label': 'Compute Node',
    'twin_model_label': 'Base LLM',
    'twin_voice_label': 'Vocalizer',
    'twin_kb_desc': 'Upload vectorized knowledge files.',
    'twin_kb_upload': 'Upload Data',
    'twin_kb_empty': 'Memory Empty',
    'twin_mount_title': 'Mount Skills',
    'twin_mount_desc': 'Equip your Twin with acquired skills.',
    'twin_mount_empty': 'No skills acquired. Visit Plaza to get skills.',

    // Global Chat
    'gc_title': 'Global Uplink',
    'gc_subtitle': 'Secure Channel: CN <-> US',
    'gc_trans_on': 'Trans ON',
    'gc_trans_off': 'Trans OFF',
    'gc_speaking': 'Transmitting...',
    'gc_tap_to_speak': 'Hold to Transmit',
    'gc_listening': 'Receiving...',
    'gc_partner_name': 'Steve (NYC)',
    'gc_partner_status': 'Connected | English',

    // Mining / Incentives
    'mining_title': 'Data Mining',
    'mining_subtitle': 'Contributing to the neural net',
    'mining_today': 'Mined Output',
    'mining_rate': 'Hashrate',
    'mining_rate_val': '+5 Token / Block',
    'reward_toast': 'Block Mined: +5 Tokens',

    // Chat Takeover
    'chat_takeover_btn': 'Neural Link',
    'chat_taking_over': 'Establishing Link...',
    'chat_human_connected': 'Operator Connected',

    'card_hire': 'Get',
    'card_try': 'Try',
    'card_open': 'Open',
    'card_stars': 'Heat',
    'card_platform': 'Origin',
    
    // Featured / Badges
    'sect_featured': 'Featured',
    'badge_choice': 'Editors Choice',
    'badge_featured': 'Featured',
    
    'chat_interview_mode': 'SKILL TRIAL MODE',
    'chat_interview_desc': 'Testing capabilities. Get this skill to mount it to your Twin.',
    'chat_hired_mode': 'SKILL ACQUIRED',
    'chat_btn_hire': 'Get Skill',
    'chat_placeholder': 'Send command...',
    'chat_thinking': 'Computing...',
    'chat_sources': 'SOURCES',
    
    'sync_title': 'Agent Excavation',
    'sync_desc': 'Scanning networks to excavate high-value agents.',
    'btn_sync_start': 'Start Excavation',
    'btn_sync_finish': 'Import Agents',
    'sync_status_scan_coze': 'Mining Coze Nodes...',
    'sync_status_scan_github': 'Indexing GitHub...',
    'sync_status_scan_openai': 'Handshaking OpenAI...',
    'sync_status_analyzing': 'Parsing Agent Core...',
    'sync_status_done': 'Excavation Complete',
    'sync_channels_title': 'Frequencies',
    'sync_results_title': 'Excavated Agents',
    'sync_result_desc': '{count} new agents excavated.',
    'sync_no_new': 'No new signals.',
    
    // Scan Settings
    'sync_settings_title': 'Mining Config',
    'sync_settings_subtitle': 'Target frequencies',
    'btn_save_settings': 'Update Config',
    
    'offer_title': 'Acquire Skill',
    'offer_subtitle': 'Add to your local library',
    'offer_candidate': 'Skill Name',
    'offer_salary': 'Acquisition Cost',
    'offer_confirm': 'Get Skill',
    'offer_cancel': 'Cancel',
    
    'alert_insufficient': 'Insufficient credits!',
    'ws_no_agents': 'Skill Library Empty',
    'ws_hire_hint': 'Excavate and Get agents from the Plaza.',
    'ws_title': 'My Skills',
    'ws_subtitle': 'Equipped Intelligence',
    'ws_browse_btn': 'Go to Plaza',
    
    // Auto Scan Notification
    'toast_auto_found': 'Agent Detected',
    'toast_auto_desc': 'Compatible agent nearby',
    
    'prof_title': 'Me',
    'prof_credits': 'Compute Credits',
    'prof_balance': 'Balance',
    'prof_lang': 'System Language',
    'prof_pref_lang': 'Comm Language',
    'prof_identity': 'Meta Identity',
    'prof_did': 'DID Address',
    'prof_phone': 'Secure Node',
    'prof_bind': 'Bind Node',
    'prof_bound': 'Node Linked',
    
    // Phone Bind
    'bind_title': 'Bind Secure Node',
    'bind_desc': 'Link your mobile number to generate a unique Blockchain ID. This ensures data consistency across terminals.',
    'bind_input_ph': 'Mobile Number',
    'bind_input_code': 'Auth Code',
    'bind_btn_code': 'Send Code',
    'bind_btn_confirm': 'Activate Node',
  },
  zh: {
    'nav_discover': '广场',
    'nav_workspace': '技能',
    'nav_social': '社区',
    'nav_profile': '我的',
    
    'market_title': 'AgentLink',
    'market_subtitle': '发现与链接高价值智能体',

    // Plaza / Market
    'plaza_search_ph': '搜索智能体...',
    'plaza_header_excavated': '新挖掘智能体',
    'plaza_agents_suffix': '个智能体',
    'plaza_no_results': '未搜索到信号。',
    'plaza_reset_btn': '重置筛选',
    'filter_global': '全网',
    
    // Filters
    'filter_source_title': '来源信道',
    'source_all': '全网信道',

    // Categories
    'cat_all': '全部',
    'cat_new arrivals': '⚡️ 新挖掘',
    'cat_official': '官方认证',
    'cat_creative': '创意引擎',
    'cat_coding': '代码核心',
    'cat_lifestyle': '生活OS',
    'cat_business': '商业分析',
    'cat_companion': '情感链接',
    
    // Regions
    'region_all': '全球节点',
    'region_china': 'CN 节点',
    'region_usa': 'US 节点',
    'region_japan': 'JP 节点',
    'region_europe': 'EU 节点',
    
    // Community / Digital Twin
    'comm_title': '信号广场',
    'comm_my_twin': '我的数字分身',
    'comm_edit_twin': '矩阵配置',
    'comm_twin_desc': '分身将在网络中自动运行。您可随时通过神经链路接管。',
    'comm_residents': '活跃节点 (Twins)',
    'comm_chat_twin': '回路测试',
    'comm_status_auto': '自动托管中',
    'comm_status_human': '操作员接管',
    'btn_save_twin': '更新核心数据',
    'placeholder_twin_instruction': '设定分身的最高指令，例如：“你是我在技术领域的数字化身...”',
    'comm_global_connect': '全球链路 (Beta)',
    'comm_global_desc': '跨语言实时语音流。',
    'comm_skill_filter': '核心能力',
    'comm_status_filter': '运行状态',
    'status_online': '在线',
    'status_all': '全部',
    'comm_recent_title': '近期传输',
    'comm_mounted_skills': '挂载模组',
    'skill_coding': '开发',
    'skill_creative': '设计',
    'skill_business': '金融',
    'skill_lifestyle': '生活',

    'comm_add_twin': '新建分身',
    'comm_my_selves': '我的分身',
    'comm_live_zones': '活跃区域',

    // Twin Config Tabs
    'twin_tab_persona': '人设矩阵',
    'twin_tab_engine': '计算引擎',
    'twin_tab_knowledge': '记忆库',
    'twin_region_label': '算力节点',
    'twin_model_label': '基座模型',
    'twin_voice_label': '发声模组',
    'twin_kb_desc': '上传文档 (PDF, MD, TXT)，扩展分身的向量记忆。',
    'twin_kb_upload': '注入数据',
    'twin_kb_empty': '暂无记忆数据',
    'twin_mount_title': '技能挂载',
    'twin_mount_desc': '将已获取的技能装备给您的数字分身。',
    'twin_mount_empty': '暂无可用技能，请前往广场获取。',

    // Global Chat
    'gc_title': '全球链路',
    'gc_subtitle': '加密通道：北京 <-> 纽约',
    'gc_trans_on': '翻译开',
    'gc_trans_off': '翻译关',
    'gc_speaking': '正在录入...',
    'gc_tap_to_speak': '按住传输',
    'gc_listening': '接收信号...',
    'gc_partner_name': 'Steve (纽约)',
    'gc_partner_status': '在线 | 英语',

    // Mining / Incentives
    'mining_title': '数据挖矿',
    'mining_subtitle': '贡献交互数据获取算力奖励',
    'mining_today': '今日产出',
    'mining_rate': '哈希率',
    'mining_rate_val': '+5 积分 / 区块',
    'reward_toast': '区块奖励 +5 积分！',

    // Chat Takeover
    'chat_takeover_btn': '神经接管',
    'chat_taking_over': '正在同步神经链路...',
    'chat_human_connected': '操作员已接入',

    'card_hire': '获取',
    'card_try': '试用',
    'card_open': '打开',
    'card_stars': '热度',
    'card_platform': '来源',
    
    // Featured / Badges
    'sect_featured': '精选推荐',
    'badge_choice': '编辑甄选',
    'badge_featured': '精选',
    
    'chat_interview_mode': '技能试用模式',
    'chat_interview_desc': '测试能力中。获取后可将其挂载至分身。',
    'chat_hired_mode': '已获取技能',
    'chat_btn_hire': '获取技能',
    'chat_placeholder': '发送指令...',
    'chat_thinking': '计算中...',
    'chat_sources': '参考源',
    
    'sync_title': '智能体挖掘',
    'sync_desc': '深度扫描外部网络，挖掘潜藏的高价值智能体。',
    'btn_sync_start': '启动挖掘',
    'btn_sync_finish': '入库智能体',
    'sync_status_scan_coze': '正在挖掘 Coze 节点...',
    'sync_status_scan_github': '正在索引 GitHub 仓库...',
    'sync_status_scan_openai': '正在握手 OpenAI API...',
    'sync_status_analyzing': '正在解析智能体核心...',
    'sync_status_done': '挖掘完成',
    'sync_channels_title': '活跃频段',
    'sync_results_title': '新挖掘智能体',
    'sync_result_desc': '成功挖掘 {count} 个新智能体。',
    'sync_no_new': '未挖掘到新信号',

    // Scan Settings
    'sync_settings_title': '挖掘配置',
    'sync_settings_subtitle': '定向搜索频段',
    'btn_save_settings': '保存配置',
    
    'offer_title': '获取技能',
    'offer_subtitle': '将此节点加入您的技能库',
    'offer_candidate': '技能名称',
    'offer_salary': '获取算力',
    'offer_confirm': '确认获取',
    'offer_cancel': '取消',
    
    'alert_insufficient': '算力积分不足！',
    'ws_no_agents': '暂未获取技能',
    'ws_hire_hint': '前往广场挖掘并获取更多技能。',
    'ws_title': '我的技能',
    'ws_subtitle': '已获取的智能体能力',
    'ws_browse_btn': '前往广场',

    // Auto Scan Notification
    'toast_auto_found': '发现新智能体',
    'toast_auto_desc': '附近发现兼容智能体信号',
    
    'prof_title': '我的',
    'prof_credits': '算力积分',
    'prof_balance': '剩余算力',
    'prof_lang': '系统语言',
    'prof_pref_lang': '偏好语言',
    'prof_identity': '元身份',
    'prof_did': 'DID 地址',
    'prof_phone': '安全节点',
    'prof_bind': '绑定节点',
    'prof_bound': '已链接节点',
    
    // Phone Bind
    'bind_title': '绑定安全节点',
    'bind_desc': '链接您的移动终端号码以生成唯一的区块链 ID (DID)。这确保了跨终端的数据一致性。',
    'bind_input_ph': '移动终端号码',
    'bind_input_code': '验证码',
    'bind_btn_code': '发送验证码',
    'bind_btn_confirm': '激活节点',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize language based on device/browser settings
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language.startsWith('zh') ? 'zh' : 'en';
    }
    return 'en'; // Default fallback
  }); 

  const t = (key: string, params?: Record<string, string>) => {
    let text = translations[language][key] || key;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{${paramKey}}`, paramValue);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
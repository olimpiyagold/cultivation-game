'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap, Key, Info } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { useGame } from '@/lib/game/context';
import { getMockAIResponse } from '@/lib/game/mockAI';
import type { ResonanceResult } from '@/lib/game/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'resonance';
  content: string;
  resonance?: ResonanceResult;
  timestamp: string;
  aiPowered?: boolean;
}

export function ChatTab() {
  const { t, locale } = useI18n();
  const { logs, hero, pet, npcMemories, triggerDaoResonance } = useGame();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [usingUserKey, setUsingUserKey] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, isThinking]);

  const handleSend = async () => {
    if (!input.trim() || isThinking || !hero) return;
    const userContent = input.trim();
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: userContent, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);
    const resonanceResult = await triggerDaoResonance(userContent, locale);
    if (resonanceResult && resonanceResult.type !== 'none') {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'resonance', content: resonanceResult.feedback, resonance: resonanceResult, timestamp: new Date().toISOString() }]);
    }
    const recentLogs = logs.slice(-5);
    const response = await getMockAIResponse({ hero, pet, recentLogs, npcMemories, userMessage: userContent }, locale);
    setRemaining(response.remaining);
    setUsingUserKey(response.usingUserKey);
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: response.text, timestamp: new Date().toISOString(), aiPowered: response.remaining !== null || response.usingUserKey }]);
    setIsThinking(false);
  };

  const quotaLabel = usingUserKey ? (locale === 'ru' ? 'Ваш ключ' : locale === 'zh' ? '自定义密钥' : 'Your key') : remaining !== null ? (locale === 'ru' ? `${remaining}/10 генераций` : locale === 'zh' ? `${remaining}/10 次生成` : `${remaining}/10 left`) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2.5 border-b border-border/30 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="font-calligraphy text-sm font-semibold flex items-center gap-2"><Bot className="w-4 h-4 text-jade" />{t.chat.title}</h2>
          {quotaLabel && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${usingUserKey ? 'text-jade border-jade/40 bg-jade/10' : remaining === 0 ? 'text-crimson border-crimson/40 bg-crimson/10' : 'text-gold border-gold/30 bg-gold/10'}`}>
              <Key className="w-2.5 h-2.5" />{quotaLabel}
            </span>
          )}
        </div>
        {hero && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {npcMemories.length > 0 ? `${npcMemories.length} souls · ` : ''}
            {locale === 'en' ? 'Type to trigger Dao Resonance' : locale === 'ru' ? 'Пишите для запуска Резонанса' : '输入文字触发道法共鸣'}
          </p>
        )}
        {remaining === 0 && !usingUserKey && (
          <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {locale === 'ru' ? 'Лимит на сегодня исчерпан. Добавьте свой ключ в Настройках.' : locale === 'zh' ? '今日配额已用完，在设置中添加您的密钥。' : 'Daily AI limit reached. Add your own API key in Settings.'}
          </p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="p-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-10 space-y-3">
              <div className="text-4xl font-calligraphy text-gold/50 animate-pulse-glow">道</div>
              <p className="text-xs text-muted-foreground italic">
                {locale === 'en' && 'Your words shape the hero\'s Dao...'}
                {locale === 'ru' && 'Ваши слова формируют Дао героя...'}
                {locale === 'zh' && '你的话语塑造英雄的道途...'}
              </p>
              <div className="max-w-xs mx-auto text-[10px] text-muted-foreground/60 space-y-1 text-left bg-muted/20 rounded-xl p-3">
                <p className="font-medium">Dao Resonance keywords:</p>
                <p>⚔ fight/attack → Sword path</p>
                <p>☯ meditate/peace → Spirit path</p>
                <p>💰 gold/trade → Trade path</p>
                <p>📜 learn/explore → Scholar path</p>
                <p>⚗ pill/alchemy → Alchemy path</p>
              </div>
            </div>
          )}
          {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}
          {isThinking && (
            <div className="flex items-start gap-2 animate-float-up">
              <div className="w-7 h-7 rounded-full bg-jade/20 flex items-center justify-center shrink-0"><Bot className="w-3.5 h-3.5 text-jade" /></div>
              <div className="bg-card border border-border/50 rounded-xl rounded-tl-sm px-3 py-2 flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground italic">{t.chat.thinking}</span>
                {[0, 150, 300].map(d => <span key={d} className="w-1 h-1 rounded-full bg-jade/60 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="p-3 border-t border-border/30 bg-background/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder={t.chat.placeholder}
            className="flex-1 bg-muted/50 border border-border/50 rounded-full px-4 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all" />
          <button onClick={handleSend} disabled={!input.trim() || isThinking}
            className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === 'resonance') {
    const pathBoost = msg.resonance?.pathBoost;
    const pathIcons: Record<string, string> = { sword: '⚔', alchemy: '⚗', trade: '💰', spirit: '☯', scholar: '📜' };
    return (
      <div className="animate-float-up">
        <div className="mx-auto max-w-[90%] bg-jade/10 border border-jade/30 rounded-xl p-2.5 flex items-start gap-2">
          <Zap className="w-3.5 h-3.5 text-jade shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-semibold text-jade uppercase tracking-wider">Dao Resonance {pathBoost ? `— ${pathIcons[pathBoost]} ${pathBoost}` : ''}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{msg.content}</p>
          </div>
        </div>
      </div>
    );
  }
  const isUser = msg.role === 'user';
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''} animate-float-up`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-gold/20' : 'bg-jade/20'}`}>
        {isUser ? <User className="w-3.5 h-3.5 text-gold" /> : <Bot className="w-3.5 h-3.5 text-jade" />}
      </div>
      <div className={`max-w-[78%] px-3 py-2 text-sm leading-relaxed rounded-xl ${isUser ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border/50 rounded-tl-sm'}`}>
        <p>{msg.content}</p>
        <span className={`text-[10px] mt-1 block ${isUser ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>{time}</span>
      </div>
    </div>
  );
}

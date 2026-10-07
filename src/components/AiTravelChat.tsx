import React, { useState, useRef, useEffect } from 'react';
import { UserPreferences } from '../types';
import { formatINR } from '../utils/budgetEngine';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  ArrowRight, 
  Compass, 
  Check, 
  MessageSquare 
} from 'lucide-react';

interface AiTravelChatProps {
  isOpen: boolean;
  onClose: () => void;
  userPrefs: UserPreferences;
  onApplyPlanUpdate: (updatedPrefs: Partial<UserPreferences>) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionSuggestion?: {
    budget?: number;
    destination?: string;
  };
}

export const AiTravelChat: React.FC<AiTravelChatProps> = ({
  isOpen,
  onClose,
  userPrefs,
  onApplyPlanUpdate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I'm PocketTrip AI. Tell me your available budget (e.g. "I have ₹7,000 from Madurai") or ask how to optimize your trip, stays, and activities!`,
      timestamp: 'Just now',
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'I have ₹7,000. Where can I go from Madurai?',
    'I have ₹15,000 for 4 people.',
    'Can I include more adventure activities?',
    'Make my hotel cheaper.',
    'I have ₹20,000. Give me a 5-day trip.',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            origin: userPrefs.origin,
            budget: userPrefs.budget,
            travellers: userPrefs.travellers,
            days: userPrefs.days,
            travelStyle: userPrefs.travelStyle,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Chat failed');
      }

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionSuggestion: data.actionSuggestion,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `With your current budget of ${formatINR(userPrefs.budget)} starting from ${userPrefs.origin}, top recommended destinations are Kodaikanal, Rameswaram, and Pondicherry! You can adjust your budget anytime in the planner.`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[95vw] sm:w-[420px] max-h-[640px] h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
      {/* Header */}
      <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Ask PocketTrip AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <span className="text-[10px] text-slate-400">
              Synced with your {formatINR(userPrefs.budget)} budget from {userPrefs.origin}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="bg-slate-950/70 px-4 py-2 border-b border-slate-800/80 overflow-x-auto no-scrollbar flex items-center gap-2">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-900/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                msg.sender === 'ai'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {msg.sender === 'ai' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed ${
                msg.sender === 'ai'
                  ? 'bg-slate-950 border border-slate-800 text-slate-200'
                  : 'bg-cyan-600 text-white font-medium'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Action suggestion pill if detected */}
              {msg.actionSuggestion && (msg.actionSuggestion.budget || msg.actionSuggestion.destination) && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-bold">
                    Suggested Planner Update:
                  </span>
                  <button
                    onClick={() => {
                      if (msg.actionSuggestion?.budget) {
                        onApplyPlanUpdate({ budget: msg.actionSuggestion.budget });
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <span>Apply {msg.actionSuggestion.budget ? formatINR(msg.actionSuggestion.budget) : ''}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              <span className="block text-[9px] text-slate-500 mt-1 text-right">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 p-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>PocketTrip AI is calculating estimates...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask anything (e.g. I have ₹7,000 for 2 days)..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

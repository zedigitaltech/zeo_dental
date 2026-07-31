import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { ChatMessage, LoadingState } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { useTranslation } from '../hooks/useTranslation';

export const ChatWidget: React.FC = () => {
  const { t, language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [isOverDark, setIsOverDark] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Detect if button is over a dark section
  useEffect(() => {
    const checkBackground = () => {
      if (!buttonRef.current) return;

      const buttonRect = buttonRef.current.getBoundingClientRect();
      const buttonCenterY = buttonRect.top + buttonRect.height / 2;

      // Check if over footer (white background)
      const footer = document.querySelector('footer');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        if (buttonCenterY >= footerRect.top && buttonCenterY <= footerRect.bottom) {
          setIsOverDark(false);
          return;
        }
      }

      // Get all sections and check which one the button is over
      const sections = document.querySelectorAll('section');
      let isDark = true; // Default to dark (hero section)

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (buttonCenterY >= rect.top && buttonCenterY <= rect.bottom) {
          // Check if this section has dark background
          const bgClass = section.className;
          isDark =
            bgClass.includes('bg-studio-black') ||
            bgClass.includes('bg-black') ||
            section.id === 'home' ||
            section.id === 'contact';
        }
      });

      setIsOverDark(isDark);
    };

    checkBackground();
    window.addEventListener('scroll', checkBackground);
    window.addEventListener('resize', checkBackground);

    return () => {
      window.removeEventListener('scroll', checkBackground);
      window.removeEventListener('resize', checkBackground);
    };
  }, []);

  // Initialize and update greeting when language changes
  useEffect(() => {
    setMessages(prev => {
      const welcomeMsg: ChatMessage = {
        id: 'welcome',
        role: 'model',
        text: t('chat.greeting'),
        timestamp: new Date(),
      };
      // If no messages yet, just set the welcome message
      if (prev.length === 0) return [welcomeMsg];
      // Otherwise, update only the welcome message, preserve conversation
      return prev.map(msg => (msg.id === 'welcome' ? welcomeMsg : msg));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim() || loadingState === LoadingState.LOADING) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoadingState(LoadingState.LOADING);

    try {
      const responseText = await sendMessageToGemini(userMsg.text, language);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-studio-black p-5 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-studio-gold/30 flex items-center justify-center text-studio-gold relative">
                <Bot size={22} strokeWidth={1.5} />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-studio-gold"></span>
              </div>
              <div>
                <h3 className="text-white font-serif text-lg">{t('chat.assistantName')}</h3>
                <p className="text-studio-gray text-[10px] uppercase tracking-wider">
                  {t('chat.status')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-studio-gray hover:text-white transition-colors focus:outline-none"
              aria-label="Close chat"
            >
              <X size={20} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-studio-light">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-studio-black text-white'
                      : 'bg-white text-studio-black border border-gray-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loadingState === LoadingState.LOADING && (
              <div className="flex justify-start">
                <div className="bg-white p-4 border border-gray-100 flex items-center gap-3">
                  <Loader2 size={14} className="animate-spin text-studio-gold" />
                  <span className="text-xs text-studio-gray">{t('chat.typing')}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={t('chat.placeholder')}
                aria-label="Type your message to the dental assistant"
                className="flex-1 bg-studio-light border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-studio-gold transition-all text-studio-black placeholder:text-studio-gray"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || loadingState === LoadingState.LOADING}
                className="p-3 bg-studio-black text-white hover:bg-studio-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus:outline-none"
                aria-label="Send message"
              >
                <Send size={18} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
            <div className="text-center mt-3">
              <span className="text-[10px] text-studio-gray tracking-wide">
                {t('chat.disclaimer')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button - Transparent with outline icon */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none bg-transparent ${
          isOpen ? 'rotate-90' : ''
        } ${
          isOverDark
            ? 'text-white hover:text-studio-gold'
            : 'text-studio-black hover:text-studio-gold'
        }`}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
      >
        {isOpen ? (
          <X size={32} strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <MessageCircle size={32} strokeWidth={1.5} aria-hidden="true" />
        )}
      </button>
    </div>
  );
};

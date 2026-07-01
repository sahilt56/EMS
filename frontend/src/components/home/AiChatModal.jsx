import React, { memo } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const AiChatModal = ({ 
  isOpen, 
  onClose, 
  chatLogs, 
  chatInput, 
  setChatInput, 
  handleAskAssistant, 
  isAiLoading, 
  handleStarterPrompt 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🤖 AI Smart Event Finder"
      footer={
        <form onSubmit={handleAskAssistant} className="flex items-center w-full space-x-2 bg-darkBg rounded-xl p-1 border border-darkBorder/50">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask about price, date, or recommendations..."
            className="flex-grow border-none focus:ring-0 bg-transparent px-3"
            disabled={isAiLoading}
            aria-label="Ask the AI Assistant"
          />
          <Button 
            type="submit" 
            disabled={isAiLoading || !chatInput.trim()} 
            className="py-2.5 px-4 sm:px-5 focus:ring-2 focus:ring-brand-500 focus:outline-none focus:ring-offset-1 focus:ring-offset-darkBg disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
            aria-label="Send message"
          >
            Send
          </Button>
        </form>
      }
    >
      <div className="flex flex-col space-y-4 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-darkBorder scrollbar-track-transparent">
        {chatLogs.map((log, idx) => (
          <div
            key={idx}
            className={`flex flex-col p-4 rounded-2xl text-sm w-fit max-w-[90%] sm:max-w-[85%] shadow-sm ${
              log.role === 'user'
                ? 'bg-brand-600/20 border border-brand-500/30 text-slate-100 self-end rounded-br-sm'
                : 'bg-darkSurface border border-darkBorder text-slate-300 self-start rounded-bl-sm'
            }`}
            role="log"
            aria-live="polite"
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              {log.role === 'user' ? 'You' : 'Gemini Assistant'}
            </span>
            <p className="whitespace-pre-wrap leading-relaxed">{log.text}</p>
          </div>
        ))}

        {isAiLoading && (
          <div className="flex items-center space-x-3 text-slate-500 text-xs self-start bg-darkSurface border border-darkBorder p-4 rounded-2xl rounded-bl-sm animate-pulse" aria-live="polite">
            <svg className="w-4 h-4 animate-spin text-brand-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Assistant is typing...</span>
          </div>
        )}
      </div>

      {/* Starter Prompts */}
      <div className="mt-6 border-t border-darkBorder/40 pt-5">
        <p className="text-xs text-slate-500 mb-3 font-medium">Try asking:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStarterPrompt('What events are happening?')}
            className="text-xs px-4 py-2 sm:py-1.5 rounded-full bg-darkBg border border-darkBorder text-slate-400 hover:text-slate-200 hover:border-brand-500 hover:bg-darkSurface focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all active:scale-95 shadow-sm"
            aria-label="Ask what events are happening"
          >
            🔍 List all events
          </button>
          <button
            onClick={() => handleStarterPrompt('Recommend a cheap or free event')}
            className="text-xs px-4 py-2 sm:py-1.5 rounded-full bg-darkBg border border-darkBorder text-slate-400 hover:text-slate-200 hover:border-brand-500 hover:bg-darkSurface focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all active:scale-95 shadow-sm"
            aria-label="Ask for cheap or free events"
          >
            💰 Cheap/Free events
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default memo(AiChatModal);

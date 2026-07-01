import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Import Modular Home Components
import HeroSection from '../components/home/HeroSection';
import TrendingEvents from '../components/home/TrendingEvents';
import FeaturesSection from '../components/home/FeaturesSection';
import AiChatModal from '../components/home/AiChatModal';

export const Home = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // AI Assistant States
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLogs, setChatLogs] = useState([
    { role: 'assistant', text: 'Hello! I am your AI Event Assistant. Ask me anything about upcoming events, schedules, or check-ins!' }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Fetch upcoming events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events');
        setEvents(response.data.data.slice(0, 3)); // show first 3
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Memoized callback to avoid recreating function on every render
  const handleAskAssistant = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatLogs((prev) => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');
    setIsAiLoading(true);

    try {
      if (!user) {
        setChatLogs((prev) => [
          ...prev,
          { role: 'assistant', text: '⚠️ You need to sign in to access the Smart AI Event Assistant. Please [Sign In](/auth) to try it!' }
        ]);
        setIsAiLoading(false);
        return;
      }

      const response = await api.post('/events/assistant', { message: userMessage });
      const assistantReply = response.data.data.reply;
      setChatLogs((prev) => [...prev, { role: 'assistant', text: assistantReply }]);
    } catch (err) {
      console.error(err);
      setChatLogs((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, I encountered an error communicating with the AI service. Make sure you are signed in.' }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  }, [chatInput, user]);

  // Memoized callback for starter prompts
  const handleStarterPrompt = useCallback((promptText) => {
    setChatInput(promptText);
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-200 overflow-x-hidden flex flex-col w-full">
      {/* Hero Section */}
      <HeroSection user={user} onOpenAssistant={() => setIsAssistantOpen(true)} />

      {/* Trending Events Showcase */}
      <TrendingEvents events={events} loading={loading} user={user} />

      {/* Features Section for Organizers */}
      <FeaturesSection />

      {/* Floating AI Chat Assistant Modal */}
      <AiChatModal 
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        chatLogs={chatLogs}
        chatInput={chatInput}
        setChatInput={setChatInput}
        handleAskAssistant={handleAskAssistant}
        isAiLoading={isAiLoading}
        handleStarterPrompt={handleStarterPrompt}
      />
    </div>
  );
};

export default Home;

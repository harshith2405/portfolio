import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { conversationApi } from '../services/api';

const ChatArea = ({ conversationId }) => {
  const [conversation, setConversation] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversationId) {
      loadConversation();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      const res = await conversationApi.get(conversationId);
      setConversation(res.data);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const content = input;
    setInput('');
    setSending(true);

    try {
      // Optimistic update could go here, but for simplicity we wait for response
      const res = await conversationApi.sendMessage(conversationId, content);
      setConversation(res.data);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Ideally show a toast
    } finally {
      setSending(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
        <Bot size={48} className="mb-4 opacity-50" />
        <p>Select a conversation or start a new one</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <h2 className="font-semibold">{conversation?.title || 'Chat'}</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={`w-2 h-2 rounded-full ${conversation?.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
          {conversation?.status}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation?.messages?.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                  : 'bg-muted text-muted-foreground rounded-tl-none'
              }`}
              data-testid={`message-${msg.id}`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.intent && (
                <div className="mt-1 text-[10px] opacity-70 border-t border-white/20 pt-1">
                  Intent: {msg.intent}
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && (
           <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
               <Bot size={16} />
             </div>
             <div className="bg-muted p-3 rounded-lg rounded-tl-none">
               <Loader2 className="animate-spin" size={16} />
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={sending}
            data-testid="message-input"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="send-btn"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;

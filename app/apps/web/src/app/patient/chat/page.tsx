"use client";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Loader2, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Markdown from 'react-markdown';

type Message = {
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
};

const DISCLAIMER = `Hello! 👋 I'm your healthcare information assistant. I can help you with:

* General health and wellness information
* Medical terms explanation
* Finding the right type of doctor
* Preventive health tips

> **Important**: I cannot diagnose conditions or provide specific medical advice. Always consult healthcare professionals for medical decisions.

How can I help you today?`;

const MessageBubble = ({ message, isLast }: { message: Message; isLast: boolean }) => {
  const isUser = message.type === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex gap-3 items-start",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
        isUser ? "bg-primary" : "bg-muted"
      )}>
        {isUser ? (
          <User className={cn("h-4 w-4", isUser ? "text-primary-foreground" : "text-muted-foreground")} />
        ) : (
          <Bot className={cn("h-4 w-4", isUser ? "text-primary-foreground" : "text-muted-foreground")} />
        )}
      </div>
      <div className={cn(
        "flex flex-col gap-2 rounded-lg px-4 py-3 max-w-[80%] shadow-sm",
        isUser ? "bg-primary text-primary-foreground" : "bg-card"
      )}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="markdown prose prose-sm dark:prose-invert max-w-none">
            <Markdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-primary pl-4 italic my-2">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
              }}
            >
              {message.content}
            </Markdown>
          </div>
        )}
        <span className="text-[10px] opacity-50 select-none">
          {new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          }).format(message.timestamp)}
        </span>
      </div>
    </motion.div>
  );
};

export default function PatientChat() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { type: 'ai', content: DISCLAIMER, timestamp: new Date() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    try {
      setIsLoading(true);
      // Add user message to chat
      setChatHistory(prev => [...prev, { 
        type: 'user', 
        content: message,
        timestamp: new Date()
      }]);
      
      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI response to chat
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        content: data.response,
        timestamp: new Date()
      }]);
      setMessage("");
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-background h-[calc(100vh-6rem)]">
      <div className="max-w-4xl mx-auto p-6 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Healthcare Assistant</h1>
        </div>
        
        {/* Chat History */}
        <div 
          ref={chatContainerRef}
          className="flex-1 space-y-6 overflow-y-auto px-4 py-2 rounded-lg border bg-card/50"
        >
          <AnimatePresence initial={false}>
            {chatHistory.map((msg, index) => (
              <MessageBubble 
                key={index} 
                message={msg} 
                isLast={index === chatHistory.length - 1} 
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Message Input */}
        <div className="mt-4">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="relative flex-1">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here... (Press Enter to send)"
                className="min-h-[60px] w-full pr-12 resize-none"
                disabled={isLoading}
              />
              <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                {message.length > 0 && "Press Enter ↵"}
              </div>
            </div>
            <Button 
              type="submit" 
              size="icon" 
              className="h-[60px] w-[60px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 
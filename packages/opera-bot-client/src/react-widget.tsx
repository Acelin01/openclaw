import i18n from "i18next";
import { Send, Bot, X, User, Mic, Paperclip, ChevronDown } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { OperaBotClient } from "./client";
import { OperaBotClientConfig, ChatMessage, QuickReply, UserBehavior } from "./types";

export interface OperaBotWidgetProps {
  config: OperaBotClientConfig;
  className?: string;
  onMessage?: (message: ChatMessage) => void;
  onAnalyticsUpdate?: (analytics: any) => void;
}

export const OperaBotWidget: React.FC<OperaBotWidgetProps> = ({
  config,
  className = "",
  onMessage,
  onAnalyticsUpdate,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(true);

  const clientRef = useRef<OperaBotClient | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize OperaBot client
  useEffect(() => {
    // Initialize i18n if not already initialized
    import("./i18n").then(({ initOperaBotI18n }) => {
      if (!i18n.isInitialized) {
        initOperaBotI18n();
      }
    });

    const client = new OperaBotClient(config);
    clientRef.current = client;

    // Set up event listeners
    client.on("ready", () => {
      setIsConnected(true);
    });

    client.on("message", ({ message, quickReplies: replies }) => {
      setMessages((prev) => [...prev, message]);
      setQuickReplies(replies || []);
      onMessage?.(message);
    });

    client.on("typing", ({ isTyping }) => {
      setIsTyping(isTyping);
    });

    // Track behavior for advanced analytics
    client.on("behavior_tracked", (behavior: UserBehavior) => {
      onAnalyticsUpdate?.(behavior);
    });

    client.on("message_sent", () => {
      const behavior: UserBehavior = {
        userId: config.userId || "anonymous",
        sessionId: clientRef.current?.getSessionId() || "",
        pageUrl: window.location.href,
        timestamp: Date.now(),
        action: "message_sent",
        metadata: {
          widgetOpen: isOpen,
          messageCount: messages.length,
        },
      };
      onAnalyticsUpdate?.(behavior);
    });

    client.on("error", (error) => {
      console.error("OperaBot error:", error);
      setIsConnected(false);
    });

    client.on("connection", ({ status }) => {
      setIsConnected(status === "connected");
    });

    // Initialize connection
    client.initialize().catch(console.error);

    return () => {
      client.destroy();
    };
  }, [config, onMessage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = useCallback(() => {
    if (!inputValue.trim() || !clientRef.current) return;

    clientRef.current.send(inputValue.trim());
    setInputValue("");
  }, [inputValue]);

  const handleQuickReply = useCallback((reply: QuickReply) => {
    if (!clientRef.current) return;

    clientRef.current.send(reply.text);
    setShowQuickReplies(false);
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getIntentIcon = (intent?: string) => {
    switch (intent) {
      case "business_operation":
        return "📊";
      case "database_query":
        return "🗄️";
      case "api_request":
        return "🌐";
      case "greeting":
        return "👋";
      default:
        return "🤖";
    }
  };

  if (!config.apiKey) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
        {t("operaBot.errors.configurationError")}
      </div>
    );
  }

  return (
    <div className={`opera-bot-widget ${className}`}>
      {/* Chat Widget */}
      <div className={`opera-bot-chat ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="opera-bot-header">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot className="w-6 h-6" />
              <div
                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </div>
            <div>
              <h3 className="font-semibold">{t("operaBot.widgetTitle")}</h3>
              <p className="text-sm opacity-90">
                {isConnected ? t("operaBot.online") : t("operaBot.offline")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="opera-bot-messages">
          {messages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">{t("operaBot.widgetWelcome")}</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex mb-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-start space-x-2 max-w-xs ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <span className="text-sm">{getIntentIcon(message.metadata?.intent)}</span>
                  )}
                </div>
                <div
                  className={`flex flex-col space-y-1 ${message.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg max-w-xs ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.metadata?.intent && (
                      <div className="mt-2 text-xs opacity-75 flex items-center space-x-1">
                        <span>{getIntentIcon(message.metadata.intent)}</span>
                        <span>{message.metadata.intent}</span>
                        {message.metadata.confidence && (
                          <span>({(message.metadata.confidence * 100).toFixed(0)}%)</span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {quickReplies.length > 0 && showQuickReplies && (
          <div className="px-4 py-2 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{t("operaBot.quickReplies")}</span>
              <button
                onClick={() => setShowQuickReplies(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                >
                  {reply.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="opera-bot-input-container">
          <div className="flex space-x-2">
            {config.features?.enableFileUpload && (
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Paperclip className="w-5 h-5" />
              </button>
            )}
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("operaBot.inputPlaceholder")}
              className="opera-bot-input"
              rows={1}
              disabled={!isConnected}
            />
            {config.features?.enableVoice && (
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Mic className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || !isConnected}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">{t("operaBot.enterToSend")}</p>
        </div>
      </div>

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            // Track widget open behavior
            if (clientRef.current) {
              const behavior: UserBehavior = {
                userId: config.userId || "anonymous",
                sessionId: clientRef.current.getSessionId() || "",
                pageUrl: window.location.href,
                timestamp: Date.now(),
                action: "widget_opened",
                metadata: {
                  messageCount: messages.length,
                  currentPage: window.location.pathname,
                },
              };
              onAnalyticsUpdate?.(behavior);
            }
          }}
          className="opera-bot-button"
          title={t("operaBot.widgetTitle")}
        >
          <Bot className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
};

export default OperaBotWidget;

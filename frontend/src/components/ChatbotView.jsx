import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  FileText,
  MessageSquare,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRoundCheck,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

const suggestions = [
  { icon: FileText, label: 'Documents', prompt: 'What documents are required for the UP Scholarship application?' },
  { icon: UserRoundCheck, label: 'Eligibility', prompt: 'Am I eligible for this scholarship?' },
  { icon: Sparkles, label: 'How to apply', prompt: 'How do I apply for the scholarship?' },
  { icon: ShieldCheck, label: 'Application status', prompt: 'How can I check my application status?' },
];
function readSavedRatings(storageKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

export default function ChatbotView({ user, onShowToast }) {
  const feedbackStorageKey = `scholarship_chat_feedback:${user?.id ?? user?.email ?? 'current'}`;
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [ratings, setRatings] = useState(() => readSavedRatings(feedbackStorageKey));
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const abortController = useRef(null);
  const messagesEnd = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const loadHistory = async () => {
      try {
        const history = await api.getChatConversations();
        if (cancelled) return;
        setConversations(history);
        if (history.length) {
          const conversation = await api.getChatConversation(history[0].id);
          if (!cancelled) {
            setActiveConversation(conversation);
            setMessages(conversation.messages || []);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load your chat history.');
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    };
    loadHistory();
    return () => {
      cancelled = true;
      abortController.current?.abort();
    };
  }, []);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const startConversation = () => {
    setError('');
    setHistoryOpen(false);
    if (sending) return;
    setActiveConversation(null);
    setMessages([]);
    setDraft('');
  };

  const openConversation = async (conversationId) => {
    setError('');
    setHistoryOpen(false);
    try {
      const conversation = await api.getChatConversation(conversationId);
      setActiveConversation(conversation);
      setMessages(conversation.messages || []);
    } catch (err) {
      setError(err.message || 'Could not open this conversation.');
    }
  };

  const removeConversation = async (conversationId, event) => {
    event.stopPropagation();
    try {
      await api.deleteChatConversation(conversationId);
      const remaining = conversations.filter((conversation) => conversation.id !== conversationId);
      setConversations(remaining);
      if (activeConversation?.id === conversationId) {
        if (remaining.length) {
          await openConversation(remaining[0].id);
        } else {
          setActiveConversation(null);
          setMessages([]);
        }
      }
      onShowToast?.({ type: 'success', message: 'Conversation deleted.' });
    } catch (err) {
      setError(err.message || 'Could not delete this conversation.');
    }
  };

  const sendMessage = async (event) => {
    event?.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;

    setError('');
    setDraft('');
    setSending(true);
    const userMessage = {
      id: `local-user-${Date.now()}`,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    const assistantId = `local-assistant-${Date.now()}`;
    setMessages((current) => [
      ...current,
      userMessage,
      { id: assistantId, role: 'assistant', content: '', created_at: new Date().toISOString() },
    ]);

    try {
      let conversation = activeConversation;
      if (!conversation) {
        conversation = await api.createChatConversation(content.slice(0, 80));
        setActiveConversation(conversation);
      }

      const controller = new AbortController();
      abortController.current = controller;
      await api.streamChatMessage(conversation.id, content, {
        signal: controller.signal,
        onToken: (token) => {
          setMessages((current) => current.map((message) => (
            message.id === assistantId
              ? { ...message, content: message.content + token }
              : message
          )));
        },
      });

      const updatedConversation = await api.getChatConversation(conversation.id);
      setActiveConversation(updatedConversation);
      setMessages(updatedConversation.messages || []);
      setConversations((current) => [
        updatedConversation,
        ...current.filter((item) => item.id !== updatedConversation.id),
      ]);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'The assistant could not answer. Please try again.');
        setMessages((current) => current.filter((message) => (
          message.id !== assistantId || message.content
        )));
      }
    } finally {
      abortController.current = null;
      setSending(false);
    }
  };

  const stopResponse = () => abortController.current?.abort();

  const copyResponse = async (message) => {
    try {
      let copied = false;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(message.content);
          copied = true;
        } catch {
          // Fall back for browsers that expose clipboard access but deny it here.
        }
      }
      if (!copied) {
        const temporaryInput = document.createElement('textarea');
        temporaryInput.value = message.content;
        temporaryInput.setAttribute('readonly', '');
        temporaryInput.style.position = 'fixed';
        temporaryInput.style.opacity = '0';
        document.body.appendChild(temporaryInput);
        temporaryInput.select();
        copied = document.execCommand('copy');
        temporaryInput.remove();
      }
      if (!copied) throw new Error('Clipboard access is unavailable');
      onShowToast?.({ type: 'success', message: 'Response copied to clipboard.' });
    } catch {
      onShowToast?.({ type: 'error', message: 'Could not copy this response.' });
    }
  };

  const rateResponse = (messageId, rating) => {
    setRatings((current) => {
      const next = { ...current };
      const key = String(messageId);
      if (next[key] === rating) delete next[key];
      else next[key] = rating;
      try {
        localStorage.setItem(feedbackStorageKey, JSON.stringify(next));
      } catch {
        // Keep the current selection usable when browser storage is unavailable.
      }
      return next;
    });
  };

  const chooseSuggestion = (prompt) => {
    setDraft(prompt);
  };

  return (
    <section className="chat-page" aria-label="Scholarship assistant">
      <header className="chat-page-header">
        <div className="chat-heading-icon"><Bot size={23} /></div>
        <div className="chat-page-heading-copy">
          <span className="chat-eyebrow"><Sparkles size={13} /> AI scholarship support</span>
          <h1>Scholarship assistant</h1>
          <p>Clear, practical guidance for your UP Scholarship application.</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary chat-history-mobile-toggle"
          onClick={() => setHistoryOpen((open) => !open)}
          aria-expanded={historyOpen}
          aria-controls="chat-history"
        >
          <MessageSquare size={16} /> History
        </button>
      </header>

      <div className="chat-workspace">
        <aside
          className={`chat-history${historyOpen ? ' chat-history-open' : ''}`}
          id="chat-history"
          aria-label="Chat history"
        >
          <div className="chat-history-header">
            <span>Recent conversations</span>
            <button
              type="button"
              className="chat-icon-button chat-history-close"
              onClick={() => setHistoryOpen(false)}
              aria-label="Close chat history"
            >
              <X size={18} />
            </button>
          </div>
          <button type="button" className="chat-new-button" onClick={startConversation} disabled={sending}>
            <Plus size={17} /> New conversation
          </button>
          <div className="chat-history-list">
            {loadingHistory ? (
              <p className="chat-history-empty">Loading history…</p>
            ) : conversations.length ? (
              conversations.map((conversation) => (
                <div
                  className={`chat-history-item${activeConversation?.id === conversation.id ? ' chat-history-item-active' : ''}`}
                  key={conversation.id}
                >
                  <button
                    type="button"
                    className="chat-history-select"
                    onClick={() => openConversation(conversation.id)}
                    title={conversation.title}
                  >
                    <MessageSquare size={15} />
                    <span>{conversation.title}</span>
                  </button>
                  <button
                    type="button"
                    className="chat-icon-button chat-delete-button"
                    onClick={(event) => removeConversation(conversation.id, event)}
                    aria-label={`Delete ${conversation.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            ) : (
              <p className="chat-history-empty">Your conversations will appear here.</p>
            )}
          </div>
          <p className="chat-privacy-note">
            Chat history is private to your account. Don’t share passwords, OTPs, or full identity numbers.
          </p>
        </aside>

        <div className="chat-panel">
          <div className="chat-messages" aria-live="polite" aria-relevant="additions text">
            {loadingHistory && messages.length === 0 ? (
              <div className="chat-loading-state" role="status">Loading your scholarship assistant…</div>
            ) : messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="chat-welcome-mark"><Bot size={30} /></div>
                <span className="chat-welcome-kicker">Your scholarship guide</span>
                <h2>How can I help you prepare?</h2>
                <p>Get help organizing your application, understanding documents, and finding official guidance.</p>
                <div className="chat-suggestions">
                  {suggestions.map(({ icon: Icon, label, prompt }) => (
                    <button
                      type="button"
                      className="chat-suggestion-card"
                      key={label}
                      onClick={() => chooseSuggestion(prompt)}
                      disabled={sending}
                    >
                      <Icon size={17} />
                      <span><strong>{label}</strong><small>{prompt}</small></span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  message={message}
                  key={message.id}
                  rating={ratings[String(message.id)]}
                  onCopy={copyResponse}
                  onRate={rateResponse}
                />
              ))
            )}
            {error && <div className="chat-error" role="alert">{error}</div>}
            <div ref={messagesEnd} />
          </div>

          <ChatInput
            draft={draft}
            sending={sending}
            onDraftChange={setDraft}
            onSend={sendMessage}
            onStop={stopResponse}
          />
          <p className="chat-disclaimer">AI responses may be inaccurate. Verify deadlines and requirements on the official scholarship portal.</p>
        </div>
      </div>
    </section>
  );
}

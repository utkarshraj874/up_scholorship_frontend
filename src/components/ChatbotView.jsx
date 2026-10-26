import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { api } from '../services/api';

const suggestions = [
  'Which documents should I prepare?',
  'How do I keep my scholarship profile ready?',
  'Where can I verify official application details?',
];

export default function ChatbotView({ onShowToast }) {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
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
        if (!cancelled) {
          setError(err.message || 'Could not load your chat history.');
        }
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

  const startConversation = async () => {
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

  return (
    <section className="chat-page" aria-label="Scholarship assistant">
      <header className="chat-page-header">
        <div className="chat-heading-icon"><Bot size={23} /></div>
        <div>
          <span className="chat-eyebrow"><Sparkles size={13} /> AI scholarship support</span>
          <h1>Scholarship assistant</h1>
          <p>Ask general questions about preparing your UP Scholarship application.</p>
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
            {messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="chat-welcome-mark"><Bot size={30} /></div>
                <h2>How can I help you prepare?</h2>
                <p>Ask a general question about documents, profile preparation, or where to find official guidance.</p>
                <div className="chat-suggestions">
                  {suggestions.map((suggestion) => (
                    <button
                      type="button"
                      key={suggestion}
                      onClick={() => setDraft(suggestion)}
                      disabled={sending}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <article
                  className={`chat-message chat-message-${message.role}`}
                  key={message.id}
                >
                  <span className="chat-message-avatar">
                    {message.role === 'assistant' ? <Bot size={17} /> : <UserRound size={16} />}
                  </span>
                  <div className="chat-message-body">
                    <strong>{message.role === 'assistant' ? 'Assistant' : 'You'}</strong>
                    <p>{message.content || (sending ? 'Thinking…' : '')}</p>
                  </div>
                </article>
              ))
            )}
            {error && <div className="chat-error" role="alert">{error}</div>}
            <div ref={messagesEnd} />
          </div>

          <form className="chat-composer" onSubmit={sendMessage}>
            <label className="sr-only" htmlFor="chat-message">Your message</label>
            <textarea
              id="chat-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask about scholarship preparation…"
              rows={1}
              maxLength={4000}
              disabled={sending}
            />
            {sending ? (
              <button type="button" className="chat-send-button chat-stop-button" onClick={stopResponse} aria-label="Stop response">
                <X size={18} />
              </button>
            ) : (
              <button type="submit" className="chat-send-button" disabled={!draft.trim()} aria-label="Send message">
                <Send size={17} />
              </button>
            )}
          </form>
          <p className="chat-disclaimer">AI responses can be inaccurate. Verify requirements on the official scholarship portal.</p>
        </div>
      </div>
    </section>
  );
}

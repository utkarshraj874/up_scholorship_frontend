import { lazy, Suspense } from 'react';
import { Bot, Check, Copy, ThumbsDown, ThumbsUp, UserRound } from 'lucide-react';

const ChatMarkdown = lazy(() => import('./ChatMarkdown'));

export default function ChatMessage({ message, rating, onCopy, onRate }) {
  const isAssistant = message.role === 'assistant';

  return (
    <article className={`chat-message chat-message-${message.role}`}>
      <span className="chat-message-avatar" aria-hidden="true">
        {isAssistant ? <Bot size={17} /> : <UserRound size={16} />}
      </span>
      <div className="chat-message-content">
        <div className="chat-message-body">
          <strong>{isAssistant ? 'Scholarship assistant' : 'You'}</strong>
          {message.content ? (
            <Suspense fallback={<p className="chat-formatting-state">Formatting response…</p>}>
              <ChatMarkdown content={message.content} />
            </Suspense>
          ) : (
            <p className="chat-thinking" aria-live="polite">
              <span className="chat-thinking-dots" aria-hidden="true"><i /><i /><i /></span>
              Thinking
            </p>
          )}
        </div>
        {isAssistant && message.content && (
          <div className="chat-message-actions" aria-label="Response actions">
            <button type="button" onClick={() => onCopy(message)} aria-label="Copy response" title="Copy response">
              <Copy size={14} /> <span>Copy</span>
            </button>
            <span className="chat-action-divider" aria-hidden="true" />
            <button
              type="button"
              className={rating === 'up' ? 'chat-action-selected' : ''}
              onClick={() => onRate(message.id, 'up')}
              aria-label="Helpful response"
              aria-pressed={rating === 'up'}
              title="Helpful"
            >
              <ThumbsUp size={14} />
            </button>
            <button
              type="button"
              className={rating === 'down' ? 'chat-action-selected' : ''}
              onClick={() => onRate(message.id, 'down')}
              aria-label="Unhelpful response"
              aria-pressed={rating === 'down'}
              title="Not helpful"
            >
              <ThumbsDown size={14} />
            </button>
            {rating && <span className="chat-rating-saved"><Check size={12} /> Saved on this device</span>}
          </div>
        )}
      </div>
    </article>
  );
}

import { Send, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function ChatInput({ draft, sending, onDraftChange, onSend, onStop }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [draft]);

  return (
    <form className="chat-composer" onSubmit={onSend}>
      <label className="sr-only" htmlFor="chat-message">Your message</label>
      <textarea
        ref={textareaRef}
        id="chat-message"
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            if (!sending && draft.trim()) onSend();
          }
        }}
        placeholder="Ask about your scholarship application…"
        rows={1}
        maxLength={4000}
        disabled={sending}
        aria-describedby="chat-input-hint"
      />
      {sending ? (
        <button type="button" className="chat-send-button chat-stop-button" onClick={onStop} aria-label="Stop response" title="Stop response">
          <X size={18} />
        </button>
      ) : (
        <button type="submit" className="chat-send-button" disabled={!draft.trim()} aria-label="Send message" title="Send message">
          <Send size={17} />
        </button>
      )}
      <span id="chat-input-hint" className="sr-only">Press Enter to send. Press Shift and Enter for a new line.</span>
    </form>
  );
}

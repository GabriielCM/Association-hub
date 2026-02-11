import { useState, useCallback, useRef } from 'react';
import { useWebSocket } from '@/providers/WebSocketProvider';

export function useTyping(conversationId: string) {
  const { emit } = useWebSocket();
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      emit('typing.stop', { conversationId });
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [isTyping, emit, conversationId]);

  const handleTextChange = useCallback(
    (text: string) => {
      if (text.length > 0 && !isTyping) {
        setIsTyping(true);
        emit('typing.start', { conversationId });
      }

      // Reset the debounce timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        emit('typing.stop', { conversationId });
        timeoutRef.current = null;
      }, 2000);

      // If text is empty, stop immediately
      if (text.length === 0) {
        stopTyping();
      }
    },
    [isTyping, emit, conversationId, stopTyping]
  );

  return { handleTextChange, stopTyping };
}

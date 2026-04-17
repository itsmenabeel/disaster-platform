import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Manages fetching and sending messages for one SOS thread.
 * Polls every 8 s while isActive is true (stops automatically on resolved requests).
 *
 * @param {string}  sosId    - The _id of the SOS request whose thread to load.
 * @param {boolean} isActive - Pass false to stop polling (e.g. when SOS is resolved).
 */
const useMessages = (sosId, isActive) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!sosId) return;
    try {
      const res = await api.get(`/sos/${sosId}/messages`);
      setMessages(res.data.data);
      setError('');
    } catch (err) {
      // 403 = no volunteer assigned yet; treat as "no messages" rather than an error
      if (err.response?.status !== 403) {
        setError(err.response?.data?.message || 'Failed to load messages.');
      }
    } finally {
      setLoading(false);
    }
  }, [sosId]);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetchMessages();
  }, [fetchMessages]);

  // Poll every 8 s, but only while the SOS is still active
  useEffect(() => {
    if (!isActive) return;
    const iv = setInterval(fetchMessages, 8000);
    return () => clearInterval(iv);
  }, [isActive, fetchMessages]);

  /**
   * Sends a new message and optimistically appends it to the local list.
   * Throws on failure so the caller can surface the error.
   *
   * @param {string} content
   */
  const sendMessage = async (content) => {
    setSending(true);
    try {
      const res = await api.post(`/sos/${sosId}/messages`, { content });
      // Optimistic append — avoids a round-trip re-fetch
      setMessages((prev) => [...prev, res.data.data]);
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, error, sending, sendMessage };
};

export default useMessages;

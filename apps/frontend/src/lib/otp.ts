'use client';

import { useEffect, useState } from 'react';
import { ApiError, postJson } from './api';
import { track } from './analytics';

type Purpose = 'apply' | 'score' | 'callback';

/** Send and verify a one-time password; returns a short-lived verification token on success. */
export function useOtp(purpose: Purpose) {
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function send(mobile: string, extra?: Record<string, unknown>): Promise<boolean> {
    setSending(true);
    setError(null);
    try {
      const r = await postJson<{ challengeId: string; resendAfter: number }>('/otp/send', {
        mobile,
        purpose,
        ...extra,
      });
      setChallengeId(r.challengeId);
      setCooldown(r.resendAfter);
      track('otp_sent', { purpose });
      return true;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'We could not send the code. Try again.');
      return false;
    } finally {
      setSending(false);
    }
  }

  async function verify(code: string): Promise<string | null> {
    if (!challengeId) return null;
    setVerifying(true);
    setError(null);
    try {
      const r = await postJson<{ verificationToken: string }>('/otp/verify', { challengeId, code });
      track('otp_verified', { purpose });
      return r.verificationToken;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'That code did not work. Try again.');
      return null;
    } finally {
      setVerifying(false);
    }
  }

  const reset = () => {
    setChallengeId(null);
    setError(null);
  };

  return {
    challengeId,
    sent: challengeId !== null,
    sending,
    verifying,
    error,
    cooldown,
    send,
    verify,
    reset,
  };
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Lock, MinusCircle } from 'lucide-react';
import { BASE_DOCS, PRODUCTS, emi, formatINR, isProductSlug, tenureLabel, type OfferSort } from '@dk/shared';
import { ApiError, api, postJson } from '@/lib/api';
import { takeHandoff } from '@/lib/handoff';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { toRupees } from '../forms/inputs';
import { StepLoan } from './StepLoan';
import { StepVerify } from './StepVerify';
import { StepOffers } from './StepOffers';
import { StepDetails, type DetailsValues } from './StepDetails';
import { StepDone } from './StepDone';
import type { ApplicationDone, LeadSession, LoanDraft, OfferView, OffersResponse } from './types';

const LABELS = ['Your loan', 'Verify', 'Offers', 'Details', 'Done'];

// The hero matcher's answers are read once per page load (this component renders only in the browser).
let handoffCache: ReturnType<typeof takeHandoff> | undefined;
const readHandoffOnce = () => (handoffCache ??= takeHandoff());

function initialDraft(q: string | null): LoanDraft {
  const h = readHandoffOnce();
  const product = h.product ?? (q && isProductSlug(q) ? q : 'personal-loan');
  return {
    product,
    amount: h.amount ? h.amount.toLocaleString('en-IN') : '',
    tenureMonths: PRODUCTS[product].tenure.default,
    employment: 'salaried',
    monthlyIncome: '',
  };
}

function utmFromUrl(sp: URLSearchParams) {
  const u: Record<string, string> = {};
  for (const k of ['source', 'medium', 'campaign', 'term', 'content']) {
    const v = sp.get(`utm_${k}`);
    if (v) u[k] = v.slice(0, 100);
  }
  return Object.keys(u).length ? u : undefined;
}

export function ApplyFlow() {
  const sp = useSearchParams();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<LoanDraft>(() => initialDraft(sp.get('product')));
  const [mobile, setMobile] = useState(() => readHandoffOnce().mobile ?? '');
  const [lead, setLead] = useState<LeadSession | null>(null);
  const [offers, setOffers] = useState<OffersResponse | null>(null);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [sort, setSort] = useState<OfferSort>('apr');
  const [chosen, setChosen] = useState<OfferView | null>(null);
  const [done, setDone] = useState<ApplicationDone | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const p = PRODUCTS[draft.product];
  const isCard = p.kind === 'card';
  const amount = toRupees(draft.amount);

  const loadOffers = useCallback(
    async (session: LeadSession, s: OfferSort) => {
      setLoadingOffers(true);
      setError(null);
      try {
        const r = await api<OffersResponse>(`/leads/${session.leadId}/offers?sort=${s}`, {
          token: session.leadToken,
        });
        setOffers(r);
        track('offers_viewed', { product: draft.product, count: r.offers.length });
      } catch (e) {
        setError(e instanceof ApiError ? e.message : 'We could not load offers. Try again.');
      } finally {
        setLoadingOffers(false);
      }
    },
    [draft.product],
  );

  async function onVerified(verificationToken: string) {
    setBusy(true);
    setError(null);
    try {
      const session = await postJson<LeadSession>('/leads', {
        product: draft.product,
        amount: draft.amount,
        tenureMonths: isCard ? 0 : draft.tenureMonths,
        employment: draft.employment,
        monthlyIncome: draft.monthlyIncome,
        verificationToken,
        consentContact: true,
        utm: utmFromUrl(sp),
      });
      setLead(session);
      track('lead_created', { product: draft.product });
      setStep(3);
      await loadOffers(session, sort);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function onSort(s: OfferSort) {
    setSort(s);
    if (lead) await loadOffers(lead, s);
  }

  async function onDetails(v: DetailsValues) {
    if (!lead || !chosen) return;
    setError(null);
    setFieldErrors({});
    try {
      const r = await postJson<{ referenceNo: string }>(
        '/applications',
        { ...v, offerId: chosen.id },
        lead.leadToken,
      );
      const docs = [
        ...(draft.employment === 'salaried' ? BASE_DOCS.salaried : BASE_DOCS.self),
        ...p.extraDocs,
      ];
      setDone({
        referenceNo: r.referenceNo,
        lenderName: chosen.lenderName,
        apr: chosen.apr,
        emi: chosen.emi,
        amount: chosen.amount,
        documents: docs,
        email: v.email,
        firstName: v.fullName.trim().split(' ')[0] ?? '',
      });
      track('application_submitted', { product: draft.product });
      setStep(5);
    } catch (e) {
      if (e instanceof ApiError) {
        setFieldErrors(e.fields);
        setError(e.message);
      } else setError('Something went wrong. Please try again.');
    }
  }

  const backToRequest = () => {
    setLead(null);
    setOffers(null);
    setChosen(null);
    setStep(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <nav
        aria-label="Application progress"
        className="flex flex-col gap-3 rounded-[20px] sm:rounded-[22px] bg-white px-4 sm:px-[22px] py-3.5 sm:py-[18px]"
      >
        <div className="flex items-center justify-between sm:hidden">
          <span className="text-xs font-semibold text-muted">Step {step} of {LABELS.length}</span>
          <span className="text-sm font-bold text-ink">{LABELS[step - 1]}</span>
        </div>
        <ol className="m-0 hidden sm:flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
          {LABELS.map((l, i) => {
            const k = i + 1;
            const isDone = k < step;
            const cur = k === step;
            return (
              <li
                key={l}
                className="flex items-center gap-2.5 text-sm"
                aria-current={cur ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'box-border flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold',
                    isDone
                      ? 'bg-indigo text-white'
                      : cur
                        ? 'border-2 border-indigo bg-white text-indigo'
                        : 'bg-[#EEF0F6] text-subtle',
                  )}
                >
                  {isDone ? <Check size={14} strokeWidth={3} aria-label="Done" /> : k}
                </span>
                <span
                  className={cn(
                    cur
                      ? 'font-bold text-ink'
                      : isDone
                        ? 'font-semibold text-ink'
                        : 'font-semibold text-subtle',
                  )}
                >
                  {l}
                </span>
              </li>
            );
          })}
        </ol>
        <div className="flex h-1.5 rounded-full bg-[#EEF0F6]" aria-hidden>
          <span
            className="block h-full rounded-full bg-indigo transition-[width] duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          />
        </div>
      </nav>

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[2_1_600px] flex-col gap-6">
          {step === 1 ? <StepLoan draft={draft} onChange={setDraft} onNext={() => setStep(2)} /> : null}
          {step === 2 ? (
            <StepVerify
              mobile={mobile}
              onMobile={setMobile}
              onBack={() => setStep(1)}
              onVerified={onVerified}
              draft={draft}
              utm={utmFromUrl(sp)}
              busy={busy}
              error={error}
            />
          ) : null}
          {step === 3 ? (
            <>
              {error ? (
                <div
                  role="alert"
                  className="rounded-[14px] bg-[#fff5f5] px-4 py-3 text-sm font-semibold text-[#a31b1b]"
                >
                  {error}
                </div>
              ) : null}
              <StepOffers
                data={offers}
                loading={loadingOffers}
                sort={sort}
                onSort={onSort}
                isCard={isCard}
                amount={amount}
                onChange={backToRequest}
                onPick={(o) => {
                  setChosen(o);
                  track('offer_selected', {
                    product: draft.product,
                    rank: (offers?.offers.indexOf(o) ?? 0) + 1,
                  });
                  setStep(4);
                }}
              />
            </>
          ) : null}
          {step === 4 && chosen ? (
            <StepDetails
              offer={chosen}
              salaried={draft.employment === 'salaried'}
              onBack={() => setStep(3)}
              onSubmit={onDetails}
              error={error}
              fieldErrors={fieldErrors}
            />
          ) : null}
          {step === 5 && done ? <StepDone done={done} isCard={isCard} /> : null}
        </div>

        <aside className="flex min-w-0 flex-[1_1_300px] flex-col gap-4">
          <div className="flex flex-col gap-3.5 rounded-3xl bg-white p-[22px]">
            <h2 className="m-0 font-display text-[19px] font-bold tracking-[-0.3px]">Your request</h2>
            <dl className="m-0 flex flex-col gap-2.5 text-[14.5px]">
              <Row k="Product" v={p.name} />
              <Row k="Amount" v={amount ? formatINR(amount) : 'Not set yet'} />
              {!isCard ? <Row k="Tenure" v={tenureLabel(draft.tenureMonths)} /> : null}
            </dl>
            {!isCard && amount >= 10000 ? (
              <div className="flex flex-col gap-1 rounded-[18px] bg-indigo p-4 text-white">
                <span className="text-[13px] text-on-navy">Estimated EMI from</span>
                <strong className="font-display text-[30px] tracking-[-1px]">
                  {formatINR(emi(amount, p.indicativeRate, draft.tenureMonths))}
                </strong>
                <span className="text-xs text-on-navy">
                  At {p.indicativeRate.toFixed(2)}% p.a., indicative
                </span>
              </div>
            ) : null}
          </div>
          <ul className="m-0 flex list-none flex-col gap-3 rounded-3xl bg-white p-[22px] text-sm text-muted">
            <li className="flex items-center gap-2.5">
              <Lock aria-hidden size={18} className="flex-none text-green" />
              Encrypted. Shared only with the lender you choose
            </li>
            <li className="flex items-center gap-2.5">
              <Check aria-hidden size={18} className="flex-none text-green" />
              Seeing offers doesn&apos;t touch your credit score
            </li>
            <li className="flex items-center gap-2.5">
              <MinusCircle aria-hidden size={18} className="flex-none text-green" />
              DeepFinServ never charges you a fee. Ever.
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{k}</dt>
      <dd className="m-0 font-bold">{v}</dd>
    </div>
  );
}

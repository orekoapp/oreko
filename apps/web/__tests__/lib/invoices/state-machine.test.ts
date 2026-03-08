import { describe, it, expect } from 'vitest';

const allowedTransitions: Record<string, string[]> = {
  draft: ['sent', 'voided'],
  sent: ['viewed', 'paid', 'partial', 'voided', 'draft'],
  viewed: ['paid', 'partial', 'voided'],
  partial: ['paid', 'voided'],
  paid: ['voided'],
  overdue: ['paid', 'partial', 'voided'],
  voided: ['draft'],
};

function isValidTransition(from: string, to: string): boolean {
  const allowed = allowedTransitions[from];
  return allowed ? allowed.includes(to) : false;
}

describe('Invoice State Machine', () => {
  describe('valid transitions', () => {
    it('allows draft -> sent', () => expect(isValidTransition('draft', 'sent')).toBe(true));
    it('allows sent -> viewed', () => expect(isValidTransition('sent', 'viewed')).toBe(true));
    it('allows viewed -> paid', () => expect(isValidTransition('viewed', 'paid')).toBe(true));
    it('allows sent -> paid', () => expect(isValidTransition('sent', 'paid')).toBe(true));
    it('allows partial -> paid', () => expect(isValidTransition('partial', 'paid')).toBe(true));
    it('allows paid -> voided', () => expect(isValidTransition('paid', 'voided')).toBe(true));
    it('allows overdue -> paid', () => expect(isValidTransition('overdue', 'paid')).toBe(true));
    it('allows voided -> draft (reopen)', () => expect(isValidTransition('voided', 'draft')).toBe(true));
  });

  describe('invalid transitions', () => {
    it('blocks draft -> paid (must go through sent)', () => expect(isValidTransition('draft', 'paid')).toBe(false));
    it('blocks draft -> viewed', () => expect(isValidTransition('draft', 'viewed')).toBe(false));
    it('blocks draft -> partial', () => expect(isValidTransition('draft', 'partial')).toBe(false));
    it('blocks paid -> sent', () => expect(isValidTransition('paid', 'sent')).toBe(false));
    it('blocks paid -> draft', () => expect(isValidTransition('paid', 'draft')).toBe(false));
    it('blocks voided -> sent', () => expect(isValidTransition('voided', 'sent')).toBe(false));
    it('blocks voided -> paid', () => expect(isValidTransition('voided', 'paid')).toBe(false));
  });

  describe('all statuses have defined transitions', () => {
    const allStatuses = ['draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'voided'];

    it.each(allStatuses)('status "%s" has defined transitions', (status) => {
      const transitions = allowedTransitions[status];
      expect(transitions).toBeDefined();
      expect(transitions!.length).toBeGreaterThan(0);
    });
  });
});

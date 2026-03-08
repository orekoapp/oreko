import { describe, it, expect } from 'vitest';

// Quote Lifecycle State Machine (Bug #331)
// Defines valid transitions for the full quote lifecycle:
// draft -> sent -> viewed -> accepted -> converted
// draft -> sent -> declined
// draft -> sent -> expired

const quoteTransitions: Record<string, string[]> = {
  draft: ['sent'],
  sent: ['viewed', 'declined', 'expired'],
  viewed: ['accepted', 'declined', 'expired'],
  accepted: ['converted'],
  declined: [],
  expired: [],
  converted: [],
};

function isValidTransition(from: string, to: string): boolean {
  const allowed = quoteTransitions[from];
  return allowed ? allowed.includes(to) : false;
}

function isTerminalState(status: string): boolean {
  const transitions = quoteTransitions[status];
  return transitions !== undefined && transitions.length === 0;
}

function canModify(status: string): boolean {
  // Only draft quotes can be modified
  return status === 'draft';
}

function getAvailableTransitions(status: string): string[] {
  return quoteTransitions[status] ?? [];
}

describe('Quote Lifecycle State Machine (Bug #331)', () => {
  describe('valid forward transitions', () => {
    it('allows draft -> sent', () => {
      expect(isValidTransition('draft', 'sent')).toBe(true);
    });

    it('allows sent -> viewed', () => {
      expect(isValidTransition('sent', 'viewed')).toBe(true);
    });

    it('allows viewed -> accepted', () => {
      expect(isValidTransition('viewed', 'accepted')).toBe(true);
    });

    it('allows accepted -> converted', () => {
      expect(isValidTransition('accepted', 'converted')).toBe(true);
    });

    it('allows sent -> declined', () => {
      expect(isValidTransition('sent', 'declined')).toBe(true);
    });

    it('allows sent -> expired', () => {
      expect(isValidTransition('sent', 'expired')).toBe(true);
    });

    it('allows viewed -> declined', () => {
      expect(isValidTransition('viewed', 'declined')).toBe(true);
    });

    it('allows viewed -> expired', () => {
      expect(isValidTransition('viewed', 'expired')).toBe(true);
    });
  });

  describe('invalid backward transitions', () => {
    it('blocks accepted -> draft', () => {
      expect(isValidTransition('accepted', 'draft')).toBe(false);
    });

    it('blocks sent -> draft', () => {
      expect(isValidTransition('sent', 'draft')).toBe(false);
    });

    it('blocks viewed -> sent', () => {
      expect(isValidTransition('viewed', 'sent')).toBe(false);
    });

    it('blocks converted -> accepted', () => {
      expect(isValidTransition('converted', 'accepted')).toBe(false);
    });

    it('blocks declined -> sent', () => {
      expect(isValidTransition('declined', 'sent')).toBe(false);
    });

    it('blocks expired -> sent', () => {
      expect(isValidTransition('expired', 'sent')).toBe(false);
    });
  });

  describe('invalid skip transitions', () => {
    it('blocks draft -> accepted (must go through sent/viewed)', () => {
      expect(isValidTransition('draft', 'accepted')).toBe(false);
    });

    it('blocks draft -> converted', () => {
      expect(isValidTransition('draft', 'converted')).toBe(false);
    });

    it('blocks sent -> converted (must go through accepted)', () => {
      expect(isValidTransition('sent', 'converted')).toBe(false);
    });

    it('blocks draft -> viewed', () => {
      expect(isValidTransition('draft', 'viewed')).toBe(false);
    });
  });

  describe('terminal states', () => {
    it('declined is a terminal state', () => {
      expect(isTerminalState('declined')).toBe(true);
    });

    it('expired is a terminal state', () => {
      expect(isTerminalState('expired')).toBe(true);
    });

    it('converted is a terminal state', () => {
      expect(isTerminalState('converted')).toBe(true);
    });

    it('draft is NOT a terminal state', () => {
      expect(isTerminalState('draft')).toBe(false);
    });

    it('sent is NOT a terminal state', () => {
      expect(isTerminalState('sent')).toBe(false);
    });

    it('accepted is NOT a terminal state', () => {
      expect(isTerminalState('accepted')).toBe(false);
    });
  });

  describe('modification rules', () => {
    it('allows modification of draft quotes', () => {
      expect(canModify('draft')).toBe(true);
    });

    it('prevents modification of sent quotes', () => {
      expect(canModify('sent')).toBe(false);
    });

    it('prevents modification of accepted quotes', () => {
      expect(canModify('accepted')).toBe(false);
    });

    it('prevents modification of converted quotes', () => {
      expect(canModify('converted')).toBe(false);
    });

    it('prevents modification of declined quotes', () => {
      expect(canModify('declined')).toBe(false);
    });
  });

  describe('available transitions', () => {
    it('draft has exactly one transition: sent', () => {
      expect(getAvailableTransitions('draft')).toEqual(['sent']);
    });

    it('sent has three transitions: viewed, declined, expired', () => {
      expect(getAvailableTransitions('sent')).toEqual(['viewed', 'declined', 'expired']);
    });

    it('accepted has exactly one transition: converted', () => {
      expect(getAvailableTransitions('accepted')).toEqual(['converted']);
    });

    it('terminal states have no transitions', () => {
      expect(getAvailableTransitions('declined')).toEqual([]);
      expect(getAvailableTransitions('expired')).toEqual([]);
      expect(getAvailableTransitions('converted')).toEqual([]);
    });

    it('unknown status returns empty transitions', () => {
      expect(getAvailableTransitions('nonexistent')).toEqual([]);
    });
  });

  describe('full lifecycle paths', () => {
    it('supports happy path: draft -> sent -> viewed -> accepted -> converted', () => {
      const path = ['draft', 'sent', 'viewed', 'accepted', 'converted'];
      for (let i = 0; i < path.length - 1; i++) {
        expect(isValidTransition(path[i]!, path[i + 1]!)).toBe(true);
      }
    });

    it('supports decline path: draft -> sent -> declined', () => {
      expect(isValidTransition('draft', 'sent')).toBe(true);
      expect(isValidTransition('sent', 'declined')).toBe(true);
    });

    it('supports expire path: draft -> sent -> expired', () => {
      expect(isValidTransition('draft', 'sent')).toBe(true);
      expect(isValidTransition('sent', 'expired')).toBe(true);
    });

    it('supports late decline: draft -> sent -> viewed -> declined', () => {
      expect(isValidTransition('draft', 'sent')).toBe(true);
      expect(isValidTransition('sent', 'viewed')).toBe(true);
      expect(isValidTransition('viewed', 'declined')).toBe(true);
    });
  });
});

export type PasswordStrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
  level: PasswordStrengthLevel;
  score: number; // 0–4
  checks: {
    length: boolean;
    lowercase: boolean;
    uppercase: boolean;
    number: boolean;
    special: boolean;
  };
  label: string;
}

const LABELS: Record<PasswordStrengthLevel, string> = {
  empty: '',
  weak: 'Débil',
  fair: 'Regular',
  good: 'Buena',
  strong: 'Fuerte',
};

export function getPasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };

  if (!password) {
    return { level: 'empty', score: 0, checks, label: LABELS.empty };
  }

  const passed = Object.values(checks).filter(Boolean).length;

  let level: PasswordStrengthLevel = 'weak';
  if (passed >= 5) level = 'strong';
  else if (passed >= 4) level = 'good';
  else if (passed >= 3) level = 'fair';

  const score = Math.min(4, Math.max(1, passed - 1));

  return { level, score: password ? score : 0, checks, label: LABELS[level] };
}

import { Github, Globe, Linkedin, Mail, Twitter, type LucideIcon } from 'lucide-react';
import type { SocialLink } from '@shared/types';

/** Official brand icon + color for each social link type. */
export const SOCIAL_META: Record<SocialLink['icon'], { icon: LucideIcon; color: string }> = {
  github: { icon: Github, color: '#181717' },
  linkedin: { icon: Linkedin, color: '#0A66C2' },
  twitter: { icon: Twitter, color: '#111111' },
  website: { icon: Globe, color: 'var(--accent)' },
  email: { icon: Mail, color: 'var(--accent)' },
};
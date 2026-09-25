import type { Profile } from '@shared/types';

/** Local fallback profile (also seeded in the Laravel MySQL database). */
export const localProfile: Profile = {
  id: 'me',
  name: 'Vkas',
  title: 'Full-Stack Developer',
  shortBio: "I build fast, delightful web experiences — from pixel-perfect UIs to resilient APIs. I ship complete products end-to-end and I'm open to senior full-stack or platform roles.",
  bio: 'Full-stack developer focused on React, TypeScript and Node.js. I care about performance, accessibility, and building products that feel effortless. Recently I\'ve been shipping connected TV, mobile and web apps backed by a Laravel API — and running the deployment and servers myself.',
  personalNote: 'Remote · Kathmandu. Outside work I tinker with OS-style web interfaces, real-time systems and AI-assisted workflows, and I\'m currently exploring Android TV and lean-back experiences.',
  strengths: [
    'Ship complete products — Android TV, mobile and web, end to end',
    'Laravel + React full-stack: APIs, realtime, auth and data modeling',
    'Own deployment and servers: Docker, CI/CD, monitoring and DNS',
    'Recruiter-friendly, product-minded: design, code and ship',
  ],
  openToWork: 'Open to work',
  strengthsTitle: "What I'm good at",
  strengthsIcon: 'star',
  personalNoteTitle: 'A bit about me',
  personalNoteIcon: 'sparkles',
  avatarUrl: null,
  resumeUrl: null,
  email: 'hello@example.com',
  location: 'Remote',
  yearsExperience: 5,
  socials: [
    { id: 's1', label: 'GitHub', url: 'https://github.com/yourhandle', icon: 'github' },
    { id: 's2', label: 'LinkedIn', url: 'https://linkedin.com/in/yourhandle', icon: 'linkedin' },
    { id: 's3', label: 'X / Twitter', url: 'https://x.com/yourhandle', icon: 'twitter' },
  ],
};
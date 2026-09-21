<?php

namespace Database\Seeders;

use App\Models\Experience;
use App\Models\Profile;
use App\Models\Project;
use App\Models\Skill;
use App\Models\SocialLink;
use Illuminate\Database\Seeder;

class PortfolioSeeder extends Seeder
{
    public function run(): void
    {
        $profile = Profile::query()->updateOrCreate(
            ['id' => 'me'],
            [
                'name' => 'Vkas',
                'title' => 'Full-Stack Developer',
                'short_bio' => 'I build fast, delightful web experiences — from pixel-perfect UIs to resilient APIs.',
                'bio' => 'Full-stack developer focused on React, TypeScript and Node.js. I care about performance, accessibility, and building products that feel effortless. Currently exploring OS-style web interfaces, real-time systems and AI-assisted workflows.',
                'avatar_url' => null,
                'resume_url' => null,
                'email' => 'hello@example.com',
                'location' => 'Remote',
                'years_experience' => 5,
            ],
        );

        $socials = [
            ['id' => 's1', 'label' => 'GitHub', 'url' => 'https://github.com/yourhandle', 'icon' => 'github'],
            ['id' => 's2', 'label' => 'LinkedIn', 'url' => 'https://linkedin.com/in/yourhandle', 'icon' => 'linkedin'],
            ['id' => 's3', 'label' => 'X / Twitter', 'url' => 'https://x.com/yourhandle', 'icon' => 'twitter'],
        ];

        foreach ($socials as $social) {
            $profile->socials()->updateOrCreate(['id' => $social['id']], $social);
        }

        $skills = [
            ['id' => 'sk1', 'name' => 'TypeScript', 'category' => 'languages', 'proficiency' => 95, 'years_used' => 5, 'icon' => null],
            ['id' => 'sk2', 'name' => 'React', 'category' => 'frontend', 'proficiency' => 95, 'years_used' => 5, 'icon' => null],
            ['id' => 'sk3', 'name' => 'Next.js', 'category' => 'frontend', 'proficiency' => 85, 'years_used' => 3, 'icon' => null],
            ['id' => 'sk4', 'name' => 'Tailwind CSS', 'category' => 'frontend', 'proficiency' => 90, 'years_used' => 4, 'icon' => null],
            ['id' => 'sk5', 'name' => 'Node.js', 'category' => 'backend', 'proficiency' => 90, 'years_used' => 5, 'icon' => null],
            ['id' => 'sk6', 'name' => 'Laravel', 'category' => 'backend', 'proficiency' => 88, 'years_used' => 4, 'icon' => null],
            ['id' => 'sk7', 'name' => 'PostgreSQL', 'category' => 'database', 'proficiency' => 80, 'years_used' => 4, 'icon' => null],
            ['id' => 'sk8', 'name' => 'Redis', 'category' => 'database', 'proficiency' => 72, 'years_used' => 3, 'icon' => null],
            ['id' => 'sk9', 'name' => 'Docker', 'category' => 'devops', 'proficiency' => 78, 'years_used' => 3, 'icon' => null],
            ['id' => 'sk10', 'name' => 'AWS', 'category' => 'devops', 'proficiency' => 70, 'years_used' => 2, 'icon' => null],
            ['id' => 'sk11', 'name' => 'Figma', 'category' => 'design', 'proficiency' => 82, 'years_used' => 4, 'icon' => null],
            ['id' => 'sk12', 'name' => 'Python', 'category' => 'languages', 'proficiency' => 75, 'years_used' => 4, 'icon' => null],
            ['id' => 'sk13', 'name' => 'GraphQL', 'category' => 'backend', 'proficiency' => 74, 'years_used' => 2, 'icon' => null],
            ['id' => 'sk14', 'name' => 'Vitest / Jest', 'category' => 'tools', 'proficiency' => 85, 'years_used' => 4, 'icon' => null],
        ];

        foreach ($skills as $skill) {
            Skill::query()->updateOrCreate(['id' => $skill['id']], $skill);
        }

        $projects = [
            [
                'id' => 'p1',
                'title' => 'Portfolio OS',
                'description' => 'This desktop-style portfolio with windows, widgets and glassmorphism.',
                'long_description' => 'A fully dynamic portfolio that behaves like an operating system: draggable windows, a widget grid with variants, a theme engine with 12 accents, glass blur levels and wallpapers. Built as a monorepo with a React 19 + Vite frontend and a Laravel backend serving content.',
                'tech_stack' => ['React 19', 'Vite', 'TypeScript', 'Laravel', 'Tailwind v4'],
                'category' => 'Web App',
                'featured' => true,
                'live_url' => null,
                'github_url' => null,
                'image_url' => null,
                'year' => 2026,
                'order' => 1,
            ],
            [
                'id' => 'p2',
                'title' => 'Realtime Collab Notes',
                'description' => 'Multiplayer notes with CRDT sync and presence.',
                'long_description' => 'Collaborative note editor with CRDT-based conflict-free syncing, live cursors, presence avatars and offline support. Backed by WebSockets with automatic reconnection and state recovery.',
                'tech_stack' => ['React', 'Yjs', 'WebSocket', 'Node.js', 'PostgreSQL'],
                'category' => 'Web App',
                'featured' => true,
                'live_url' => null,
                'github_url' => null,
                'image_url' => null,
                'year' => 2025,
                'order' => 2,
            ],
            [
                'id' => 'p3',
                'title' => 'DevMetrics API',
                'description' => 'Aggregated developer analytics with caching layer.',
                'long_description' => 'An API that aggregates GitHub, npm and package health metrics into clean dashboards. Multi-layer caching with Redis, rate limiting, and typed SDK generation.',
                'tech_stack' => ['Node.js', 'TypeScript', 'Redis', 'OpenAPI'],
                'category' => 'Backend',
                'featured' => true,
                'live_url' => null,
                'github_url' => null,
                'image_url' => null,
                'year' => 2025,
                'order' => 3,
            ],
            [
                'id' => 'p4',
                'title' => 'Glass UI Kit',
                'description' => 'Glassmorphism component library with theming engine.',
                'long_description' => 'A React component library implementing a full glassmorphism design system: theme tokens, accent palettes, blur levels and light/dark modes, all driven by CSS variables.',
                'tech_stack' => ['React', 'TypeScript', 'Tailwind', 'Storybook'],
                'category' => 'Library',
                'featured' => false,
                'live_url' => null,
                'github_url' => null,
                'image_url' => null,
                'year' => 2024,
                'order' => 4,
            ],
        ];

        foreach ($projects as $project) {
            Project::query()->updateOrCreate(['id' => $project['id']], $project);
        }

        $experience = [
            [
                'id' => 'e1',
                'company' => 'TechCorp',
                'role' => 'Senior Full-Stack Developer',
                'start_date' => '2023-06-01',
                'end_date' => null,
                'location' => 'Remote',
                'employment_type' => 'Full-time',
                'highlights' => [
                    'Led migration of a legacy SPA to React 19 + Vite, cutting bundle size by 40%',
                    'Designed and shipped a multi-tenant REST API serving 2M+ requests/day',
                    'Mentored 3 junior developers and established the frontend testing culture',
                ],
                'tech_stack' => ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
                'order' => 1,
            ],
            [
                'id' => 'e2',
                'company' => 'Startuply',
                'role' => 'Full-Stack Developer',
                'start_date' => '2021-03-01',
                'end_date' => '2023-05-15',
                'location' => 'Berlin, DE',
                'employment_type' => 'Full-time',
                'highlights' => [
                    'Built the customer dashboard from zero to 10k MAU',
                    'Introduced CI/CD with preview deployments, reducing release cycle from weeks to hours',
                    'Implemented realtime notifications with WebSockets at 99.95% delivery',
                ],
                'tech_stack' => ['Next.js', 'Express', 'Redis', 'Docker'],
                'order' => 2,
            ],
            [
                'id' => 'e3',
                'company' => 'WebAgency',
                'role' => 'Frontend Developer',
                'start_date' => '2019-09-01',
                'end_date' => '2021-02-28',
                'location' => 'Munich, DE',
                'employment_type' => 'Full-time',
                'highlights' => [
                    'Delivered 15+ client sites with 90+ Lighthouse scores',
                    'Created an internal component library that cut project setup time in half',
                ],
                'tech_stack' => ['Vue', 'JavaScript', 'SCSS', 'PHP'],
                'order' => 3,
            ],
        ];

        foreach ($experience as $item) {
            Experience::query()->updateOrCreate(['id' => $item['id']], $item);
        }
    }
}

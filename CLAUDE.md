# CLAUDE.md - AI Assistant Development Guide

> Comprehensive documentation for AI assistants working on soenke.me

Last Updated: 2026-01-23

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Build & Deployment](#build--deployment)
- [Design System](#design-system)
- [Code Conventions](#code-conventions)
- [Key Components](#key-components)
- [Configuration Files](#configuration-files)
- [AI Assistant Guidelines](#ai-assistant-guidelines)

---

## Project Overview

**soenke.me** is a personal portfolio website showcasing Sönke Nommensen's professional profile, experience, and projects. The site is built with modern web technologies and deployed to GitHub Pages.

- **Purpose**: Personal portfolio/resume website
- **Owner**: Sönke Nommensen (Engineering Team Lead at Tomorrow)
- **Domain**: https://soenke.me
- **Repository**: Personal GitHub repository
- **Deployment**: GitHub Pages via GitHub Actions

---

## Technology Stack

### Core Framework
- **Astro 5.16.6**: Static Site Generator (SSG) with component-based architecture
- **TypeScript 5.9.3**: Type-safe JavaScript with strict configuration
- **Node.js 18+**: Runtime environment (specified in CI)

### Styling & UI
- **TailwindCSS 3.4.19**: Utility-first CSS framework
- **@astrojs/tailwind 6.0.2**: Astro integration for Tailwind
- **Custom Design System**: "Nordic Editorial" aesthetic (see Design System section)

### Fonts
- **Instrument Serif**: Headlines and editorial text
- **Plus Jakarta Sans**: Body text and UI elements
- **JetBrains Mono**: Code and monospace content

### Build Tools
- **npm**: Package manager (package-lock.json present)
- **Astro CLI**: Build and dev server
- **TypeScript Compiler**: Type checking

---

## Project Structure

```
soenke.me/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── public/
│   ├── CNAME                   # Custom domain configuration
│   └── favicon.svg             # Site favicon
├── src/
│   ├── assets/
│   │   └── profile.jpg         # Profile image
│   ├── components/
│   │   ├── About.astro         # About section component
│   │   ├── Contact.astro       # Contact section component
│   │   ├── Experience.astro    # Experience section component
│   │   ├── Footer.astro        # Footer component
│   │   ├── Header.astro        # Navigation header component
│   │   ├── Hero.astro          # Hero/landing section
│   │   └── Projects.astro      # Projects/work section
│   ├── layouts/
│   │   └── Layout.astro        # Base layout template
│   ├── pages/
│   │   ├── index.astro         # Homepage (main entry point)
│   │   └── impressum.astro     # Legal notice page (German requirement)
│   └── env.d.ts                # TypeScript environment definitions
├── astro.config.mjs            # Astro configuration
├── tailwind.config.mjs         # TailwindCSS configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Project dependencies and scripts
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

### Directory Purposes

- **`.github/workflows/`**: CI/CD automation (deployment to GitHub Pages)
- **`public/`**: Static assets served as-is (no processing)
- **`src/assets/`**: Optimized images processed by Astro
- **`src/components/`**: Reusable Astro components (sections of the homepage)
- **`src/layouts/`**: Page layout templates with shared structure
- **`src/pages/`**: File-based routing (each file = route)

---

## Development Workflow

### Available Scripts

```bash
# Start development server (hot reload on http://localhost:4321)
npm run dev
# or
npm start

# Build for production (outputs to dist/)
npm run build

# Preview production build locally
npm run preview

# Run Astro CLI commands
npm run astro
```

### Development Server

- **URL**: http://localhost:4321
- **Hot Module Replacement**: Enabled (instant updates on save)
- **Port**: 4321 (default Astro port)

### Git Workflow

1. **Main Branch**: `main` - production-ready code
2. **Feature Branches**: Use `claude/` prefix for AI-assisted work (e.g., `claude/add-claude-documentation-VeWzs`)
3. **Commit Messages**: Clear, descriptive, include Claude Code session URL
4. **Push Strategy**: Push to feature branch, then create PR to `main`

### Code Quality

- **TypeScript**: Strict mode enabled (`astro/tsconfigs/strict`)
- **Type Checking**: Automatic via IDE and build process
- **Path Aliases**: `@/*` maps to `src/*` (configured in tsconfig.json)

---

## Build & Deployment

### Build Process

```bash
npm run build
```

**Output**: `dist/` directory with static HTML, CSS, JS, and assets

### Deployment Pipeline

**Trigger**: Push to `main` branch or manual workflow dispatch

**GitHub Actions Workflow** (`.github/workflows/deploy.yml`):

1. **Checkout**: Clone repository
2. **Setup Node**: Install Node.js 18 with npm cache
3. **Setup Pages**: Configure GitHub Pages
4. **Install**: `npm ci` (clean install from lock file)
5. **Build**: `npm run build` (generates static site)
6. **Upload**: Upload `dist/` as artifact
7. **Deploy**: Deploy to GitHub Pages

**Environment**:
- **Runner**: `ubuntu-latest`
- **Node Version**: 18
- **Package Manager**: npm
- **Permissions**: `contents: read`, `pages: write`, `id-token: write`
- **Concurrency**: One deployment at a time (cancel previous if new push)

**Result**: Site available at https://soenke.me (via CNAME in `public/`)

---

## Design System

### Theme: "Nordic Editorial"

A sophisticated design system inspired by Scandinavian minimalism and editorial design, featuring warm dark tones, subtle animations, and typographic hierarchy.

### Color Palette

#### Base Tones (Warm Blacks/Charcoals)
```css
nordic-void:      #0a0a0c  /* Deepest black */
nordic-base:      #0f0f12  /* Main background */
nordic-surface:   #18181c  /* Surface elements */
nordic-elevated:  #222228  /* Elevated surfaces */
nordic-card:      #1c1c21  /* Card backgrounds */
```

#### Borders & Lines
```css
nordic-border:        #2a2a32  /* Primary borders */
nordic-border-subtle: #1f1f26  /* Subtle dividers */
```

#### Text Hierarchy
```css
nordic-text:           #e8e6e3  /* Primary text */
nordic-text-secondary: #b8b6b3  /* Secondary text */
nordic-muted:          #7a7a7f  /* Muted/disabled text */
```

#### Accent Colors
```css
nordic-amber:      #d4a853  /* Primary accent (gold) */
nordic-amber-dim:  #b8923d  /* Dimmed accent */
nordic-amber-glow: rgba(212, 168, 83, 0.15)  /* Glow effect */

nordic-sky:        #7eb5d6  /* Highlight/links (blue) */
nordic-sky-dim:    #5a9bc4  /* Dimmed blue */
```

#### Semantic Accents
```css
nordic-sage:     #8fae8b  /* Success/green */
nordic-rose:     #c48b8b  /* Error/red */
nordic-lavender: #a89cc4  /* Info/purple */
nordic-slate:    #8a9aad  /* Neutral/gray */
```

**Note**: The design previously used Catppuccin color scheme. For backwards compatibility, Catppuccin colors remain in `tailwind.config.mjs` but should not be used in new code.

### Typography

#### Font Families
- **Serif (Editorial)**: `Instrument Serif, Georgia, serif` - Headlines, display text
- **Sans (Body)**: `Plus Jakarta Sans, system-ui, sans-serif` - Body text, UI
- **Mono (Code)**: `JetBrains Mono, Consolas, monospace` - Code snippets

#### Usage Guidelines
- Use `.font-serif` or `.font-editorial` for headlines and emphasized text
- Use default (`.font-sans`) for body text and UI elements
- Use `.font-mono` for code, technical content, or monospace needs
- Apply `.italic` to serif fonts for editorial flair

### Animations

#### Available Animations
```css
animate-fade-in:        /* Fade in (0.8s) */
animate-fade-in-up:     /* Fade in + slide up (0.8s) */
animate-fade-in-scale:  /* Fade in + scale (1s) */
animate-grain:          /* Grain texture movement (8s loop) */
animate-glow-pulse:     /* Glow pulsing effect (3s loop) */
animate-text-reveal:    /* Text reveal animation (1s) */
animate-line-grow:      /* Line grow from center (1.5s) */
```

#### Scroll-Triggered Animations
- **`.fade-in-section`**: Elements fade in when scrolled into view
- **`.stagger-item`**: Sequential fade-in for lists (auto-stagger delays)
- **Threshold**: 10% visibility triggers animation
- **Root Margin**: `-50px` bottom offset

### Visual Effects

#### Grain Texture Overlay
```html
<section class="grain-overlay">
  <!-- Content -->
</section>
```
- Adds subtle film grain texture to sections
- Animated movement for organic feel
- Opacity: 3% (non-intrusive)

#### Card Glow Effect
```html
<div class="card-glow">
  <!-- Card content -->
</div>
```
- Hover effect: amber glow shadow
- Smooth cubic-bezier transition

#### Link Underline Animation
```html
<a href="#" class="link-underline">Link text</a>
```
- Animated underline on hover
- Grows from left to right

### Layout Patterns

#### Section Structure
```astro
<section id="section-name" class="min-h-screen bg-nordic-surface grain-overlay">
  <div class="container mx-auto px-6 py-20">
    <div class="max-w-4xl mx-auto">
      <!-- Content -->
    </div>
  </div>
</section>
```

#### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

Use Tailwind responsive prefixes: `md:`, `lg:`, `xl:`

---

## Code Conventions

### Astro Components

1. **File Extension**: `.astro` for all components
2. **Component Structure**:
   ```astro
   ---
   // TypeScript/JavaScript frontmatter
   import statements

   // Props interface (if applicable)
   export interface Props {
     title: string;
   }

   const { title } = Astro.props;
   ---

   <!-- HTML template -->
   <div>
     <h1>{title}</h1>
   </div>

   <style>
     /* Scoped CSS (optional) */
   </style>

   <script>
     // Client-side JavaScript (optional)
   </script>
   ```

3. **Naming**: PascalCase for component files (e.g., `Hero.astro`, `Header.astro`)
4. **Section IDs**: Use kebab-case for section IDs (e.g., `id="hero"`, `id="about"`)

### TypeScript

1. **Configuration**: Extends `astro/tsconfigs/strict`
2. **Path Aliases**: Use `@/` for imports from `src/` (e.g., `import Layout from '@/layouts/Layout.astro'`)
3. **Type Safety**: All props should have explicit types via `interface Props`
4. **No `any`**: Avoid `any` types; use specific types or `unknown`

### CSS/Tailwind

1. **Utility-First**: Use Tailwind utilities over custom CSS when possible
2. **Custom Styles**: Add component-specific styles in `<style>` blocks (scoped)
3. **Global Styles**: Add to `Layout.astro` within `<style is:global>` tag
4. **Class Order**: Responsive classes last (e.g., `text-base md:text-lg`)
5. **Color Usage**: Always use design system colors (e.g., `text-nordic-text` not `text-gray-200`)

### JavaScript

1. **Client Scripts**: Use `<script>` tags in `.astro` files for client-side JS
2. **DOM Selection**: Wait for `DOMContentLoaded` or use inline scripts at end of body
3. **TypeScript in Scripts**: Use type assertions for DOM elements (e.g., `as HTMLElement`)
4. **Event Listeners**: Clean up listeners if component unmounts (though rare in static sites)

### Import Order

1. Astro utilities (e.g., `import { Image } from 'astro:assets'`)
2. External packages
3. Layout/component imports
4. Asset imports (images, etc.)

### Comments

- **Astro Frontmatter**: Use `//` for single-line, `/* */` for multi-line
- **HTML**: Use `<!-- -->` for template comments
- **CSS**: Use `/* */` for CSS comments
- **JavaScript**: Use `//` for single-line, `/* */` for multi-line

---

## Key Components

### Layout.astro
**Path**: `src/layouts/Layout.astro`

**Purpose**: Base HTML structure, global styles, meta tags, font loading

**Props**:
```typescript
interface Props {
  title: string;
  description?: string;  // Default: "Sönke Nommensen - Engineering Team Lead & Software Developer"
}
```

**Key Features**:
- Loads Google Fonts (Instrument Serif, Plus Jakarta Sans, JetBrains Mono)
- Global animations setup (fade-in-section, stagger-item)
- Grain texture overlay styles
- Scroll-triggered animation observer
- Selection color customization
- Smooth scrolling enabled

### Header.astro
**Path**: `src/components/Header.astro`

**Purpose**: Fixed navigation header with desktop/mobile menu

**Features**:
- Fixed position with backdrop blur
- Active section highlighting on scroll
- Smooth scroll to sections
- Responsive hamburger menu
- Logo with accent dot

**Sections**: About, Experience, Work, Contact

### Hero.astro
**Path**: `src/components/Hero.astro`

**Purpose**: Landing section with profile, headline, and CTA

**Key Elements**:
- Profile image with artistic treatment
- Animated headline with staggered reveals
- Role badge with decorative lines
- Subtitle with company link
- "Get In Touch" CTA button
- Scroll indicator
- Atmospheric background (gradient orbs, geometric decorations)
- Parallax effect on scroll

### About.astro
**Path**: `src/components/About.astro`

**Purpose**: Personal introduction and bio

### Experience.astro
**Path**: `src/components/Experience.astro`

**Purpose**: Professional experience timeline

### Projects.astro
**Path**: `src/components/Projects.astro`

**Purpose**: Portfolio of work and projects

### Contact.astro
**Path**: `src/components/Contact.astro`

**Purpose**: Contact information and social links

### Footer.astro
**Path**: `src/components/Footer.astro`

**Purpose**: Site footer with copyright and links

---

## Configuration Files

### astro.config.mjs

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  output: 'static',
  site: 'https://soenke.me'
});
```

- **Output Mode**: `static` (SSG, no server required)
- **Site URL**: Used for canonical URLs and sitemaps
- **Integrations**: TailwindCSS via official integration

### tsconfig.json

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- **Extends**: Astro's strict TypeScript config
- **Path Mapping**: `@/` alias for `src/` directory
- **Strict Mode**: Full type safety enabled

### tailwind.config.mjs

See [Design System](#design-system) section for complete color palette.

**Content**: `./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}`

**Key Extensions**:
- Custom color system (Nordic Editorial + Catppuccin legacy)
- Custom font families
- Custom animations and keyframes
- Gradient utilities

### package.json

**Scripts**:
- `dev` / `start`: Development server
- `build`: Production build
- `preview`: Preview production build
- `astro`: Run Astro CLI

**Dependencies**:
- `astro`: 5.16.6
- `baseline-browser-mapping`: 2.9.11
- `caniuse-lite`: 1.0.30001761

**Dev Dependencies**:
- `@astrojs/tailwind`: 6.0.2
- `tailwindcss`: 3.4.19
- `@types/node`: 25.0.3
- `typescript`: 5.9.3

---

## AI Assistant Guidelines

### When Working on This Project

1. **Read Before Editing**: Always read existing files before making changes
2. **Use Path Aliases**: Import from `@/` instead of relative paths when possible
3. **Follow Design System**: Only use colors/fonts from the Nordic Editorial palette
4. **Maintain TypeScript Strictness**: Always type props and avoid `any`
5. **Test Responsiveness**: Consider mobile, tablet, and desktop layouts
6. **Animation Consistency**: Use existing animation classes before creating new ones
7. **Semantic HTML**: Use appropriate HTML5 semantic elements
8. **Accessibility**: Include ARIA labels, alt text, and focus states

### Common Tasks

#### Adding a New Section
1. Create component in `src/components/NewSection.astro`
2. Import and add to `src/pages/index.astro`
3. Add navigation link to `Header.astro`
4. Use section structure pattern with `grain-overlay` and fade-in animations
5. Assign unique `id` attribute for navigation anchors

#### Modifying Colors
1. Edit `tailwind.config.mjs` to add/modify colors in `theme.extend.colors`
2. Prefer adding to `nordic` namespace
3. Update this documentation if adding new semantic colors

#### Adding New Fonts
1. Add Google Fonts link to `Layout.astro` `<head>`
2. Update `tailwind.config.mjs` to add font family in `theme.extend.fontFamily`
3. Document usage in this file

#### Updating Content
- **Profile Image**: Replace `src/assets/profile.jpg`
- **Favicon**: Replace `public/favicon.svg`
- **Domain**: Update `public/CNAME` and `astro.config.mjs`
- **Meta Tags**: Edit `Layout.astro` props

### Testing Checklist

Before committing changes:

- [ ] Run `npm run build` successfully
- [ ] Preview with `npm run preview`
- [ ] Test responsive layouts (mobile, tablet, desktop)
- [ ] Verify animations work on scroll
- [ ] Check navigation links scroll to correct sections
- [ ] Validate TypeScript types (no errors)
- [ ] Ensure accessibility (keyboard navigation, screen reader support)
- [ ] Verify color contrast meets WCAG standards
- [ ] Test mobile menu functionality
- [ ] Check all external links open in new tab

### Don't Do

- ❌ Don't use Catppuccin colors in new code (legacy only)
- ❌ Don't add dependencies without discussion
- ❌ Don't create components without TypeScript types
- ❌ Don't use inline styles (use Tailwind or `<style>` blocks)
- ❌ Don't commit `dist/` or `node_modules/` (in `.gitignore`)
- ❌ Don't use absolute colors (e.g., `#fff`) - use design system tokens
- ❌ Don't create new pages without updating navigation
- ❌ Don't remove grain overlay or animations without reason

### Do

- ✅ Use semantic HTML5 elements
- ✅ Follow Astro best practices (minimal client JS)
- ✅ Keep components small and focused
- ✅ Use TypeScript for type safety
- ✅ Write descriptive commit messages
- ✅ Test on multiple screen sizes
- ✅ Maintain design system consistency
- ✅ Document significant changes in this file
- ✅ Optimize images (use Astro's Image component)
- ✅ Keep accessibility in mind

---

## Troubleshooting

### Build Failures

**Issue**: `npm run build` fails

**Solutions**:
1. Delete `node_modules/` and `package-lock.json`, run `npm install`
2. Check for TypeScript errors: `npx astro check`
3. Ensure all imports exist and are correct
4. Verify no syntax errors in `.astro` files

### Development Server Issues

**Issue**: Hot reload not working

**Solutions**:
1. Restart dev server: `npm run dev`
2. Clear Astro cache: `rm -rf .astro`
3. Hard refresh browser (Cmd/Ctrl + Shift + R)

### Deployment Issues

**Issue**: GitHub Pages deployment fails

**Solutions**:
1. Check GitHub Actions logs in repository
2. Verify `CNAME` file has correct domain
3. Ensure `site` in `astro.config.mjs` matches domain
4. Check GitHub Pages settings in repository settings

### Style Issues

**Issue**: Tailwind classes not applying

**Solutions**:
1. Verify class names are correct (check `tailwind.config.mjs`)
2. Ensure file is in Tailwind content paths
3. Rebuild: `npm run build`
4. Check for typos in color names (e.g., `nordic-text` not `nordic-txt`)

---

## Additional Resources

- **Astro Documentation**: https://docs.astro.build
- **TailwindCSS Documentation**: https://tailwindcss.com/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **GitHub Pages Documentation**: https://docs.github.com/en/pages

---

## Changelog

### 2026-01-23
- Initial CLAUDE.md creation
- Documented Nordic Editorial design system
- Added comprehensive component documentation
- Established AI assistant guidelines
- Documented build and deployment pipeline

---

*This documentation is maintained by AI assistants working on the project. Keep it updated when making significant changes.*

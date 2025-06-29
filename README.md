# soenke.me

Personal website built with Astro and deployed to GitHub Pages.

## Build

To build the project locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploy

The site automatically deploys to GitHub Pages when changes are pushed to the `main` branch. The deployment workflow:

1. **Trigger**: Pushes to `main` branch or manual workflow dispatch
2. **Build**: Installs dependencies and builds the Astro site
3. **Deploy**: Uploads the built site to GitHub Pages
4. **Domain**: Serves at https://soenke.me via custom CNAME configuration

The deployment is handled by the GitHub Actions workflow in `.github/workflows/deploy.yml`.
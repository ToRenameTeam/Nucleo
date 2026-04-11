import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

// https://vitepress.dev/reference/site-config
export default withMermaid(defineConfig({
  base: '/Nucleo/',
  title: 'Nucleo',
  description: "Nucleo's documentation",
  vite: {
    optimizeDeps: {
      include: ['mermaid'],
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: 'Home', link: '/' }],

    sidebar: [
      {
        text: 'Nucleo Documentation',
        items: [
          { text: 'Introduction', link: '/introduction' },
          {
            text: 'Deliverables',
            items: [
              { text: 'Glossary', link: '/deliverables/glossary' },
              { text: 'Domain Model', link: '/deliverables/domain-model' },
            ],
          },
          {
            text: 'Analysis',
            items: [
              { text: 'Business Requirements', link: '/analysis/business-requirements' },
              { text: 'Functional Requirements', link: '/analysis/functional-requirements' },
              {
                text: 'Non-Functional Requirements',
                link: '/analysis/non-functional-requirements',
              },
            ],
          },
          {
            text: 'Design',
            items: [
              { text: 'Event Storming', link: '/design/event-storming' },
              { text: 'Bounded Context', link: '/design/bounded-context' },
              { text: 'Architecture', link: '/design/architecture' },
              { text: 'Microservices', link: '/design/microservices' },
              { text: 'Patterns', link: '/design/patterns' },
            ],
          },
          {
            text: 'Implementation',
            items: [
              { text: 'Microservices', link: '/implementation/microservices' },
              { text: 'Testing', link: '/implementation/testing' }
            ],
          },
          {
            text: 'DevOps',
            items: [
              { text: 'Project Structure', link: '/devops/project-structure' },
              { text: 'Version Control & Release', link: '/devops/vc-and-release' },
              { text: 'Quality Assurance', link: '/devops/quality-assurance' }
            ],
          },
          { text: 'Deployment', link: '/deployment' },
          { text: 'Conclusions', link: '/conclusions' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/ToRenameTeam/Nucleo' }],
  },
}));

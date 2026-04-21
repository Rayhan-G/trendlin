// next.config.js (COMPLETE FILE - NO CHANGES NEEDED)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com', 'via.placeholder.com'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@tiptap/pm/state': 'prosemirror-state',
      '@tiptap/pm/view': 'prosemirror-view',
      '@tiptap/pm/model': 'prosemirror-model',
      '@tiptap/pm/schema': 'prosemirror-schema-basic',
      '@tiptap/pm/transform': 'prosemirror-transform',
      '@tiptap/pm/commands': 'prosemirror-commands',
      '@tiptap/pm/keymap': 'prosemirror-keymap',
      '@tiptap/pm/dropcursor': 'prosemirror-dropcursor',
      '@tiptap/pm/gapcursor': 'prosemirror-gapcursor',
    }
    return config
  },
}

module.exports = nextConfig
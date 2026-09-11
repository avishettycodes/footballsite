/**
 * Thin Cloudflare entrypoint used by OpenAI Sites. Static files remain Vite's
 * responsibility; the platform binds that output as ASSETS at deploy time.
 */
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};

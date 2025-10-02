/// <reference types="vite/client" />
/// <reference types="node" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_NAME?: string
  readonly VITE_APP_VERSION?: string
  readonly VITE_DEV_MODE?: string
  readonly VITE_SKIP_AUTH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __dirname: string
declare const process: { env: Record<string, string | undefined> }
declare const global: typeof globalThis
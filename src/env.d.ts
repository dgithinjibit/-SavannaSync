/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JAVA_AI_SERVICE_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

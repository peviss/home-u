/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  /** `true` / `1` = force mock data; `false` / `0` = use API even in dev. */
  readonly VITE_USE_MOCK?: string
}

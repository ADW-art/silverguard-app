/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOS_DEMO_OUTCOME?: 'claimed' | 'timeout' | 'failure';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}

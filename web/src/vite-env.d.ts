/// <reference types="vite/client" />

declare module '*.svg' {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  const content: string

  export { ReactComponent }
  export default content
}

// interface ImportMetaEnv {
//   readonly HOST: string
//   readonly PORT: string
//   // more env variables...
// }

// interface ImportMeta {
//   readonly env: ImportMetaEnv
// }

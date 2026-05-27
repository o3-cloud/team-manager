// Augment React.CSSProperties to accept CSS custom properties (variables).
// Required for daisyUI components that pass --value, --size, --thickness, etc.
// as inline styles. CSS variables starting with -- are valid in browsers but
// are not present in the csstype index signature used by @types/react.
declare module "react" {
  // Extend CSSProperties to accept CSS custom properties (--var-name).
  // Record<...> syntax satisfies @typescript-eslint/consistent-indexed-object-style.
  // The empty interface body with single extends is allowed via our eslint config.
  interface CSSProperties extends Record<`--${string}`, string | number | undefined> {}
}

// export {} makes this file a module so the declare above augments rather than replaces
export {};

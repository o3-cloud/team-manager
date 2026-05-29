// Augment React CSSProperties to allow CSS custom properties (--name) in style objects.
// Required for DaisyUI components that set CSS vars like { '--value': 50 }.
// export {} makes this a module file so declare module 'react' is augmentation, not replacement.
export {};

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}

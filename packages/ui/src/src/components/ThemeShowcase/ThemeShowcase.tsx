import { ThemeSwatch } from "./ThemeSwatch";

export const DAISYUI_THEMES = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
  "caramellatte",
  "abyss",
  "silk",
] as const;

export type DaisyUITheme = (typeof DAISYUI_THEMES)[number];

export interface ThemeShowcaseProps {
  themes?: readonly DaisyUITheme[];
  title?: string;
}

export function ThemeShowcase({
  themes = DAISYUI_THEMES,
  title = "daisyUI Themes",
}: ThemeShowcaseProps) {
  return (
    <div className="min-h-screen bg-base-200 p-8">
      <header className="mb-6">
        <h1 className="font-bold text-2xl">{title}</h1>
        <p className="mt-1 text-sm opacity-70">{themes.length} themes</p>
      </header>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
        {themes.map((theme) => (
          <ThemeSwatch key={theme} theme={theme} />
        ))}
      </div>
    </div>
  );
}

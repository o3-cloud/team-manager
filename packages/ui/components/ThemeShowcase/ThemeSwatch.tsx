type DaisyUITheme = string;

export function ThemeSwatch({ theme }: { theme: DaisyUITheme }) {
  return (
    <div
      data-theme={theme}
      className="rounded-xl bg-base-100 p-4 shadow-md"
      aria-label={`Theme: ${theme}`}
    >
      <h3 className="mb-3 font-bold text-base-content text-sm capitalize">{theme}</h3>

      <div className="mb-2 flex gap-1">
        <button type="button" className="btn btn-primary btn-xs">
          Primary
        </button>
        <button type="button" className="btn btn-secondary btn-xs">
          Secondary
        </button>
        <button type="button" className="btn btn-accent btn-xs">
          Accent
        </button>
      </div>

      <div className="mb-2 flex flex-wrap gap-1">
        <span className="badge badge-info badge-sm">Info</span>
        <span className="badge badge-success badge-sm">Success</span>
        <span className="badge badge-warning badge-sm">Warning</span>
        <span className="badge badge-error badge-sm">Error</span>
      </div>

      <progress
        className="progress progress-primary mb-2 w-full"
        value={65}
        max={100}
        aria-label="Progress indicator"
      />

      <input
        type="text"
        placeholder="Text input"
        className="input input-bordered input-xs w-full"
        readOnly
        aria-label="Example text input"
      />
    </div>
  );
}

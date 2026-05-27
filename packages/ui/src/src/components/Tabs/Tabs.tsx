export type TabsVariant = "boxed" | "lifted" | "bordered";

export interface TabItem {
  label: string;
  active?: boolean;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  variant?: TabsVariant;
  onTabChange?: (index: number) => void;
  className?: string;
}

export function Tabs({ tabs, variant, onTabChange, className }: TabsProps) {
  const classes = ["tabs", variant ? `tabs-${variant}` : undefined, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div role="tablist" className={classes}>
      {tabs.map((tab, index) => (
        <button
          key={tab.label}
          type="button"
          role="tab"
          aria-selected={tab.active}
          disabled={tab.disabled}
          className={[
            "tab",
            tab.active ? "tab-active" : undefined,
            tab.disabled ? "tab-disabled" : undefined,
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={!tab.disabled ? () => onTabChange?.(index) : undefined}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

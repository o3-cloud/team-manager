export interface CountdownProps {
  hours?: number;
  minutes?: number;
  seconds?: number;
  showLabels?: boolean;
  "aria-label"?: string;
}

export function Countdown({
  hours,
  minutes,
  seconds,
  showLabels = false,
  "aria-label": ariaLabel,
}: CountdownProps) {
  return (
    <div className="flex gap-5" role="timer" aria-label={ariaLabel}>
      {hours !== undefined && (
        <div>
          <span className="countdown font-mono text-4xl">
            <span style={{ "--value": hours }} />
          </span>
          {showLabels && <span>hrs</span>}
        </div>
      )}
      {minutes !== undefined && (
        <div>
          <span className="countdown font-mono text-4xl">
            <span style={{ "--value": minutes }} />
          </span>
          {showLabels && <span>min</span>}
        </div>
      )}
      {seconds !== undefined && (
        <div>
          <span className="countdown font-mono text-4xl">
            <span style={{ "--value": seconds }} />
          </span>
          {showLabels && <span>sec</span>}
        </div>
      )}
    </div>
  );
}

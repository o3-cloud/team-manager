export type ChatSide = "start" | "end";

export interface ChatProps {
  message: string;
  side?: ChatSide;
  avatarSrc?: string;
  avatarAlt?: string;
  header?: string;
  footer?: string;
  bubbleVariant?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error";
}

export function Chat({
  message,
  side = "start",
  avatarSrc,
  avatarAlt,
  header,
  footer,
  bubbleVariant,
}: ChatProps) {
  const bubbleClasses = ["chat-bubble", bubbleVariant ? `chat-bubble-${bubbleVariant}` : undefined]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={`chat chat-${side}`}>
      {avatarSrc && (
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <img src={avatarSrc} alt={avatarAlt ?? ""} />
          </div>
        </div>
      )}
      {header && <div className="chat-header">{header}</div>}
      <div className={bubbleClasses}>{message}</div>
      {footer && <div className="chat-footer opacity-75">{footer}</div>}
    </article>
  );
}

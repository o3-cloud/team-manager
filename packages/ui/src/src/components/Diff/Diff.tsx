import type { ReactNode } from "react";

export interface DiffProps {
  itemOne: ReactNode;
  itemTwo: ReactNode;
}

export function Diff({ itemOne, itemTwo }: DiffProps) {
  return (
    <div className="diff aspect-[16/9]">
      <div className="diff-item-1">{itemOne}</div>
      <div className="diff-item-2">{itemTwo}</div>
      <div className="diff-resizer" />
    </div>
  );
}

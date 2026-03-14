export interface SavedComposition {
  id: string;
  moment: string;
  title: string;
  emotions: string[];
  instrument: string;
  composition: any;
  createdAt: string;
}

export function saveComposition(comp: SavedComposition): void {
  if (typeof window === "undefined") return;
  const existing = getCompositions();
  existing.unshift(comp);
  localStorage.setItem("harmony-compositions", JSON.stringify(existing));
}

export function getCompositions(): SavedComposition[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem("harmony-compositions");
  return data ? JSON.parse(data) : [];
}

export function deleteComposition(id: string): void {
  if (typeof window === "undefined") return;
  const existing = getCompositions().filter((c) => c.id !== id);
  localStorage.setItem("harmony-compositions", JSON.stringify(existing));
}

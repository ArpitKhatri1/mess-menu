import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string) {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  return format(date, "yyyy-MM-dd");
}
type MenuType = {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
};

export function returnMenuItems(
  menu: (string | undefined)[] | undefined
): MenuType {
  const breakfast: string[] = [];
  const lunch: string[] = [];
  const dinner: string[] = [];

  if (!menu) return { breakfast, lunch, dinner };

  let prev = "";

  menu.forEach((getItem) => {
    const item = getItem?.trim();
    if (item === "BREAKFAST") prev = "BREAKFAST";
    else if (item === "LUNCH") prev = "LUNCH";
    else if (item === "DINNER") prev = "DINNER";
    else if (item) {
      if (prev === "BREAKFAST") breakfast.push(item);
      else if (prev === "LUNCH") lunch.push(item);
      else if (prev === "DINNER") dinner.push(item);
    }
  });

  return { breakfast, lunch, dinner };
}

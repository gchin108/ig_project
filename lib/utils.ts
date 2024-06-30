import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeSince(date: Date | null): string {
  if (date === null) {
    return "";
  }
  const now = new Date();
  const secondsPast = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsPast < 60) {
    return `${secondsPast} seconds ago`;
  } else if (secondsPast < 3600) {
    const minutes = Math.floor(secondsPast / 60);
    return `${minutes} minutes ago`;
  } else if (secondsPast < 86400) {
    const hours = Math.floor(secondsPast / 3600);
    return `${hours} hours ago`;
  } else {
    const days = Math.floor(secondsPast / 86400);
    return `${days} days ago`;
  }
}

export function autoResize(textarea: HTMLElement) {
  // Reset the height to auto to shrink it back down and then measure the scrollHeight
  textarea.style.height = "auto";
  // Set the height to the scrollHeight to make the textarea expand
  textarea.style.height = textarea.scrollHeight + "px";
}

export function getKeyFromUrl(url: string) {
  const lastSlashIndex = url.lastIndexOf("/");
  const extractedKey = url.slice(lastSlashIndex + 1);
  return extractedKey;
}
export function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

import { CommentTable, LikeTable, PostTable, UserTable } from "@/db/schema";
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

export function textSlicer(sentence: string | null, maxLength = 20): string {
  if (sentence === null) return "";
  if (sentence.length <= maxLength) {
    return sentence;
  }
  return sentence.slice(0, maxLength - 3) + "...";
}
type Post = {
  post: typeof PostTable.$inferSelect & {
    names?: string[];
    likeByCurrentUser: boolean;
    postAuthor: typeof UserTable.$inferSelect & {
      likes: (typeof LikeTable.$inferSelect)[];
    };
    likes: (typeof LikeTable.$inferSelect)[];

    comments: (typeof CommentTable.$inferSelect & {
      commentUser: typeof UserTable.$inferSelect;
      replyReceiver: typeof UserTable.$inferSelect | null;
      likeByCurrentUser: boolean;
      likes: (typeof LikeTable.$inferSelect)[];
    })[];
  };
};
type NameEntry = {
  leaderId: string;
  leaderName: string | null;
  likeId: number | null;
  likePostId: string | null;
};
export const mapNamesToPosts = (posts: Post[], names: NameEntry[]): Post[] => {
  // Create a map to store the names by postId
  const nameMap: { [key: string]: string[] } = {};

  // Populate the nameMap
  names.forEach((nameEntry) => {
    if (nameEntry.likePostId === null || nameEntry.leaderName === null) return;
    if (!nameMap[nameEntry.likePostId]) {
      nameMap[nameEntry.likePostId] = [];
    }
    nameMap[nameEntry.likePostId].push(nameEntry.leaderName);
  });

  // Add the names to the posts
  posts.forEach((post) => {
    if (nameMap[post.post.id]) {
      post.post.names = nameMap[post.post.id];
    }
  });

  return posts;
};

import { cn } from "@/lib/utils";
import { HeartFilledIcon, HeartIcon } from "@radix-ui/react-icons";

type Props = {
  onClick: () => void;
  isLiked: boolean;
  sessionUserId: string | undefined;
  heartFilled?: string;
  heart?: string;
};

export const LikeBtn = ({
  onClick,
  isLiked,
  sessionUserId,
  heartFilled,
  heart,
}: Props) => {
  return (
    <button onClick={onClick}>
      {isLiked && sessionUserId ? (
        <HeartFilledIcon className={cn(heartFilled)} />
      ) : (
        <HeartIcon className={cn(heart)} />
      )}
    </button>
  );
};

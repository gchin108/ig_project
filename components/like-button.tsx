import { HeartFilledIcon, HeartIcon } from "@radix-ui/react-icons";

type Props = {
  onClick: () => void;
  isLiked: boolean;
  sessionUserId: string | undefined;
};

export const LikeBtn = ({ onClick, isLiked, sessionUserId }: Props) => {
  return (
    <button onClick={onClick}>
      {isLiked && sessionUserId ? <HeartFilledIcon /> : <HeartIcon />}
    </button>
  );
};

import { HeartFilledIcon, HeartIcon } from "@radix-ui/react-icons";

type Props = {
  onClick: () => void;
  isLiked: boolean;
};

export const LikeBtn = ({ onClick, isLiked }: Props) => {
  return (
    <button onClick={onClick}>
      {isLiked ? <HeartFilledIcon /> : <HeartIcon />}
    </button>
  );
};

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { ArrowDown } from "lucide-react";

type Props = {
  onUnfollow: () => void;
};
export const FollowActionBtn = ({ onUnfollow }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="outline-none rounded-xl bg-slate-700 px-4 hover:bg-slate-800 hover:text-white"
        >
          Following
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="bg-slate-800 text-slate-100 "
      >
        <DropdownMenuItem onClick={onUnfollow} className="cursor-pointer">
          unFollow
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

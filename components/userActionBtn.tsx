import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { PencilIcon } from "lucide-react";

type Props = {
  onAddBio: () => void;
  onAddUsername: () => void;
};
export const UserActionBtn = ({ onAddBio, onAddUsername }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <PencilIcon className="h-4 w-4 opacity-50 hover:opacity-100" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="bg-slate-800 text-slate-100 "
      >
        <DropdownMenuItem onClick={onAddUsername}>
          Add username
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddBio}>Add bio</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// import Image from "next/image";
// import React from "react";
// type Props = {
//   onClick: () => void;
// };
// export const CardContent = ({
//   onClick,
//   imageSrc,
//   authorName,
//   timeCreated,
//   content,
//   likes,
// }: Props) => {
//   return (
//     <div className="flex w-full gap-2 p-2">
//       <div className="">
//         <Image
//           src={
//             comment.commentUser.image ? comment.commentUser.image : "/lotus.svg"
//           }
//           alt="Profile Picture"
//           width={40}
//           height={10}
//           className="rounded-full object-cover"
//         />
//       </div>
//       <div className="pl-2 pr-4 flex flex-col flex-1">
//         <div className="flex gap-4 items-center">
//           <p className="font-bold text-lg">{comment.commentUser.name}</p>
//           <p className="text-slate-200/50 text-sm">
//             {timeSince(comment.created_at)}
//           </p>
//         </div>
//         <p className="my-2 w-full">{comment.content}</p>
//         <div className="flex gap-4 items-center ">
//           <LikeBtn />
//           <p>{comment.likes}</p>
//           <button onClick={onClick}>Reply</button>
//         </div>
//         {isOpen && sessionUser && (
//           <ReplyInput
//             sessionUser={sessionUser}
//             userId={userId}
//             commentId={comment.id}
//             exitCreate={() => {
//               setIsOpen(false);
//             }}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

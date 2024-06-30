import { z } from "zod";

export type FormProps = z.infer<typeof PostSchema>;

export const PostSchema = z.object({
  content: z.string().trim().min(2).max(2000),
  // imageSrc: z.union([z.literal(""), z.string().trim().url()]),
  // authorId: z.string().trim(),
});

export const pageNumberSchema = z.coerce.number().int().positive().optional();

export const authSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().max(100),
});

export type TAuth = z.infer<typeof authSchema>;

export type BioFormProps = z.infer<typeof BioSchema>;

export const BioSchema = z.object({
  content: z.string().trim().max(500),
});
export type UserNameFormProps = z.infer<typeof UsernameSchema>;

export const UsernameSchema = z.object({
  username: z.string().trim().max(10),
});

const { z } = require("zod");

exports.createPinSchema = z.object({
  body: z.object({
    accessToken: z.string().min(1, "accessToken is required"),
    boardId: z.string().min(1, "boardId is required"),
    title: z.string().optional(),
    description: z.string().optional(),
    link: z.string().url().optional(),
    scheduledTime: z.union([z.string(), z.number()]).optional(),
  }),
});

const { z } = require("zod");

exports.uploadVideoSchema = z.object({
  body: z.object({
    accessToken: z.string().min(1, "accessToken is required"),
    title: z.string().min(1, "title is required"),
    description: z.string().optional(),
    tags: z.string().optional(), // usually comes as a comma-separated string
    categoryId: z.string().optional(),
    privacyStatus: z.enum(["public", "private", "unlisted"]).optional(),
  }),
});

exports.refreshTokenSchema = z.object({
  body: z.object({
    socialAccountId: z.string().min(1, "socialAccountId is required"),
  }),
});

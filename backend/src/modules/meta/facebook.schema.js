const { z } = require("zod");

exports.postMessageSchema = z.object({
  body: z.object({
    pageId: z.string().min(1, "pageId is required"),
    pageAccessToken: z.string().min(1, "pageAccessToken is required"),
    message: z.string().min(1, "message is required"),
    scheduledTime: z.number().int().optional(),
  }),
});

// For postPhoto, createInstagramPost, createInstagramReelPost, and schedulePhotoPost
// we use multer for files, so the body fields might be strings.
// Using z.string() is fine because formdata fields come in as strings.
exports.postMediaSchema = z.object({
  body: z.object({
    pageId: z.string().optional(), // Facebook
    igUserId: z.string().optional(), // Instagram
    pageAccessToken: z.string().min(1, "pageAccessToken is required"),
    caption: z.string().optional(),
    scheduledTime: z.union([z.string(), z.number()]).optional(),
  }).refine((data) => data.pageId || data.igUserId, {
    message: "Either pageId or igUserId must be provided",
    path: ["pageId"],
  }),
});

exports.refreshTokenSchema = z.object({
  body: z.object({
    socialAccountId: z.string().min(1, "socialAccountId is required"),
  }),
});

const { z } = require("zod");

exports.schedulePostSchema = z.object({
  params: z.object({
    postId: z.string().uuid("Invalid postId format"),
  }),
});

exports.cancelScheduleSchema = z.object({
  params: z.object({
    postId: z.string().uuid("Invalid postId format"),
  }),
});

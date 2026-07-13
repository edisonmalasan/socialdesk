const { z } = require("zod");

exports.analyticsSummaryQuerySchema = z.object({
  query: z.object({
    account_id: z.string().uuid("Invalid account id format").optional(),
    from: z.string().datetime({ offset: true }).optional(),
    to: z.string().datetime({ offset: true }).optional(),
    period_type: z.string().optional(),
  }),
});

exports.analyticsPostsQuerySchema = z.object({
  query: z.object({
    account_id: z.string().uuid("Invalid account id format"),
    platform: z.string().optional(),
    from: z.string().datetime({ offset: true }).optional(),
    to: z.string().datetime({ offset: true }).optional(),
    tab: z.enum(["all", "completed", "missing"]).optional(),
  }),
});

exports.analyticsTopPostsQuerySchema = z.object({
  query: z.object({
    account_id: z.string().uuid("Invalid account id format").optional(),
    from: z.string().datetime({ offset: true }).optional(),
    to: z.string().datetime({ offset: true }).optional(),
    limit: z.string().optional(), // limit comes in as a string in query params
  }),
});

const { z } = require("zod");

/**
 * Schema for POST /api/accounts
 */
exports.connectAccountSchema = z.object({
  body: z.object({
    platformCode: z.string().min(1, "platformCode is required"),
    external_id: z.string().min(1, "external_id is required"),
    username: z.string().optional(),
    display_name: z.string().optional(),
  }),
});

/**
 * Schema for DELETE /api/accounts/:id
 */
exports.accountIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid account id format"),
  }),
});

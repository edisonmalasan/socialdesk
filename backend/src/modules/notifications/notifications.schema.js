const Joi = require("joi");

exports.getNotificationsSchema = {
  query: Joi.object({
    type: Joi.string()
      .valid("All", "Unread", "Alerts", "Social", "success", "alert", "social", "info")
      .optional()
      .allow(""),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
};

exports.idParamSchema = {
  params: Joi.object({
    id: Joi.number().integer().required(),
  }),
};

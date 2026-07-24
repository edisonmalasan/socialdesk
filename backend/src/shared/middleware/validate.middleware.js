const { errorResponse } = require("../utils/response.util");

/**
 * Validates request data (body, query, params) against a Zod schema.
 *
 * @param {object} schema - Zod schema object, e.g. z.object({ body: ... })
 * @returns {Function} Express middleware function
 */
const validate = (schema) => async (req, res, next) => {
  try {
    // Parse against the schema.
    // By convention, the schema should match the req structure: { body: {}, query: {}, params: {} }
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    next();
  } catch (error) {
    if (error instanceof require("zod").ZodError) {
      const details = error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return errorResponse(res, "Validation Error", 400, details);
    }

    console.error("Validation Middleware Error:", error);
    return errorResponse(res, "Internal Server Error during validation", 500);
  }
};

module.exports = { validate };

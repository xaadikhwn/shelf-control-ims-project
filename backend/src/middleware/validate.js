const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Replace with validated data to strip out unknown fields if using .strip()
    req.body = validatedData.body || req.body;
    req.query = validatedData.query || req.query;
    req.params = validatedData.params || req.params;
    
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      next(error);
    } else {
      next(new Error('Validation failed'));
    }
  }
};

module.exports = { validate };

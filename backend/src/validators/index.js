const { z } = require('zod');

// Auth Validators
const registerSchema = z.object({
  body: z.object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.string().optional(),
    role_id: z.union([z.number(), z.string()]).optional()
  }).passthrough()
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required")
  }).passthrough()
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email")
  }).passthrough()
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
    new_password: z.string().min(6, "Password must be at least 6 characters")
  }).passthrough()
});

// Sales Validator
const createSaleSchema = z.object({
  body: z.object({
    customer_id: z.union([z.number(), z.string()]),
    payment_status: z.enum(['paid', 'credit', 'pending']).optional().default('paid'),
    items: z.array(z.object({
      product_id: z.union([z.number(), z.string()]).transform(v => Number(v)),
      quantity: z.union([z.number(), z.string()]).transform(v => Number(v))
    })).min(1, "At least one item is required")
  }).passthrough()
});

// General paginated query
const paginatedQuerySchema = z.object({
  query: z.object({
    page: z.union([z.string(), z.number()]).optional().transform(val => (val ? parseInt(val) : 1)),
    limit: z.union([z.string(), z.number()]).optional().transform(val => (val ? parseInt(val) : 50))
  }).passthrough().optional().default({})
}).passthrough();

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createSaleSchema,
  paginatedQuerySchema
};

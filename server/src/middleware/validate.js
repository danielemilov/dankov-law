export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Невалидни данни.',
      errors: result.error.flatten().fieldErrors,
    });
  }

  req.body = result.data;
  next();
};

import Joi from 'joi';

const CreateRole = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  createdBy: Joi.string().uuid().required(),
  users: Joi.array().items(Joi.string().uuid()).optional(),
  groups: Joi.array().items(Joi.string().uuid()).optional(),
  permissions: Joi.array().items(Joi.string().uuid()).optional(),
});

const UpdateRole = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  id: Joi.string().uuid().required(),
  actor: Joi.string().uuid().required(),
});

export function validateCreateRole(
  data: unknown,
  options?: Joi.AsyncValidationOptions
): Promise<Joi.ValidationResult> {
  return CreateRole.validateAsync(data, {
    ...options,
    abortEarly: options?.abortEarly ?? false,
  });
}

export function validateUpdateRole(
  data: unknown,
  options?: Joi.AsyncValidationOptions
): Promise<Joi.ValidationResult> {
  return UpdateRole.validateAsync(data, {
    ...options,
    abortEarly: options?.abortEarly ?? false,
  });
}

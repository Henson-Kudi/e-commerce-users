import Joi from 'joi';

const CreateGroup = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  createdBy: Joi.string().uuid().required(),
  users: Joi.array().items(Joi.string().uuid()).optional(), // Array of userIds
  roles: Joi.array().items(Joi.string().uuid()).optional(), // Array of roleIds
});

const UpdateGroup = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  updatedBy: Joi.string().required(),
  id: Joi.string().uuid().required(),
});

export function validateCreateGroup(
  data: unknown,
  options?: Joi.AsyncValidationOptions
): Promise<Joi.ValidationResult> {
  return CreateGroup.validateAsync(data, {
    ...options,
    abortEarly: options?.abortEarly ?? false,
  });
}

export function validateUpdateGroup(
  data: unknown,
  options?: Joi.AsyncValidationOptions
): Promise<Joi.ValidationResult> {
  return UpdateGroup.validateAsync(data, {
    ...options,
    abortEarly: options?.abortEarly ?? false,
  });
}

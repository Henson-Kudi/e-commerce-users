import Joi from 'joi';
import { PermissionRegex } from '../../constants/permissions';

const CreatePermission = Joi.object({
  createdBy: Joi.string().uuid().required(),
  roles: Joi.array().items(Joi.string().uuid()).optional(), // list of role ids
  module: Joi.string().required(),
  resource: Joi.string().required(),
  permission: Joi.string().required().regex(PermissionRegex, {
    name: 'permission',
  }),
});

const CreatePermissions = Joi.array().items(CreatePermission);

const UpdatePermission = Joi.object({
  updatedBy: Joi.string().uuid().optional(),
  id: Joi.string().uuid().required(),
  roles: Joi.array().items(Joi.string().uuid()).optional(), // list of role ids
  permission: Joi.string().optional().regex(PermissionRegex, {
    name: 'permission',
  }),
  isActive: Joi.boolean().optional(),
});

export function validateCreatePermission(
  data: unknown,
  options?: Joi.AsyncValidationOptions
): Promise<Joi.ValidationResult> {
  return CreatePermission.validateAsync(data, {
    ...options,
    abortEarly: options?.abortEarly ?? false,
  });
}

export function validateCreatePermissions(
  data: unknown,
  options?: Joi.AsyncValidationOptions
): Promise<Joi.ValidationResult[]> {
  return CreatePermissions.validateAsync(data, {
    ...options,
    abortEarly: options?.abortEarly ?? false,
  });
}

export function validateUpdatePermission(
  data: unknown,
  options?: Joi.AsyncValidationOptions
): Promise<Joi.ValidationResult> {
  return UpdatePermission.validateAsync(data, {
    ...options,
    abortEarly: options?.abortEarly ?? false,
  });
}

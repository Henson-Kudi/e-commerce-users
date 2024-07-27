import Joi, { AsyncValidationOptions } from 'joi';

const CreateUserSchema = Joi.object({
  email: Joi.string().email().optional(),
  name: Joi.string().required(),
  phone: Joi.string().optional(),
  password: Joi.string().when('googleId', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.string().when('appleId', {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.string().required(),
    }),
  }),
  googleId: Joi.string().optional(),
  appleId: Joi.string().optional(),
  photo: Joi.string().optional(),
  invitorToken: Joi.string().optional(),
}).or('phone', 'email');

const UpdateUserSchema = Joi.object({
  name: Joi.string().optional(),
  googleId: Joi.string().optional(),
  appleId: Joi.string().optional(),
  photo: Joi.string().optional(),
  id: Joi.string().uuid().required(),
  actor: Joi.string().required(),
});

const UpdateEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  otpCode: Joi.string().required(),
  id: Joi.string().uuid().required(),
});

const UpdatePhoneNumberSchema = Joi.object({
  phone: Joi.string().required(),
  otpCode: Joi.string().required(),
  id: Joi.string().uuid().required(),
});

const ChangePasswordSchema = Joi.object({
  password: Joi.string().required(),
  otpCode: Joi.string().required(),
  id: Joi.string().uuid().required(),
});

export function validateCreateUser(
  data: unknown,
  options?: AsyncValidationOptions
) {
  return CreateUserSchema.validateAsync(data, {
    ...(options ?? {}),
    abortEarly: options?.abortEarly ?? false,
  });
}

export function validateUpdateUser(
  data: unknown,
  options?: AsyncValidationOptions
) {
  return UpdateUserSchema.validateAsync(data, {
    ...options,
    abortEarly: options?.abortEarly ?? false,
  });
}

export function validateChangeUserEmail(
  data: unknown,
  options?: AsyncValidationOptions
) {
  return UpdateEmailSchema.validateAsync(data, {
    ...options,
    abortEarly: options?.abortEarly ?? false,
  });
}

export function validateChangePassword(
  data: unknown,
  options?: AsyncValidationOptions
) {
  return ChangePasswordSchema.validateAsync(data, {
    ...options,
    abortEarly: options?.abortEarly ?? false,
  });
}

export function validateChangePhoneNumber(
  data: unknown,
  options?: AsyncValidationOptions
) {
  return UpdatePhoneNumberSchema.validateAsync(data, {
    ...options,
    abortEarly: options?.abortEarly ?? false,
  });
}

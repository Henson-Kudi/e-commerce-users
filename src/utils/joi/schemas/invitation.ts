import Joi from 'joi';

const Create = Joi.object({
  invitor: Joi.string().uuid().required(),
  invitee: Joi.string().email().required(),
  roles: Joi.array().items(Joi.string().uuid()).optional(),
  expireAt: Joi.date().optional(),
});

export default function validateCreateInvitation(
  data: unknown,
  options?: Joi.AsyncValidationOptions
) {
  return Create.validateAsync(data, {
    ...options,
    abortEarly: options?.abortEarly ?? false,
  });
}

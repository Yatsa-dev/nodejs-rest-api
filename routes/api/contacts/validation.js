/* eslint-disable prefer-regex-literals */
import Joi from 'joi';
import mongoose from 'mongoose';
import { MIN_AGE, MAX_AGE } from '../../../lib/constants';
const { Types } = mongoose;

const createSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  age: Joi.number().integer().min(MIN_AGE).max(MAX_AGE).optional(),
  favorite: Joi.bool().optional(),
});

const updateSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  age: Joi.number().integer().min(MIN_AGE).max(MAX_AGE).optional(),
  favorite: Joi.bool().optional(),
}).or('name', 'email', 'phone', 'age');

const updateFavoriteSchema = Joi.object({
  favorite: Joi.bool().optional().required(),
});
const querySchema = Joi.object({
  limit: Joi.number().min(1).max(100).optional(),
  skip: Joi.number().min(0).optional(),
  sortBy: Joi.string()
    .valid('name', 'age', 'email', 'phone', 'favorite')
    .optional(),
  sortByDesc: Joi.string()
    .valid('name', 'age', 'email', 'phone', 'favorite')
    .optional(),
  filter: Joi.string()
    .pattern(
      new RegExp(
        '(name|age|email|phone|favorite)\\|?(name|age|email|phone|favorite)+'
      )
    )
    .optional(),
});

export const validateCreate = async (req, res, next) => {
  try {
    await createSchema.validateAsync(req.body);
  } catch (error) {
    return res
      .status(400)
      .json({ message: `Field ${error.message.replace(/"/g, '')}` });
  }
  next();
};
export const validateUpdate = async (req, res, next) => {
  try {
    await updateSchema.validateAsync(req.body);
  } catch (error) {
    const [{ type }] = error.details;
    if (type === 'object.missing') {
      return res.status(400).json({ message: 'missing fields' });
    }
    return res.status(400).json({ message: error.message });
  }
  next();
};

export const validateUpdateFavorite = async (req, res, next) => {
  try {
    await updateFavoriteSchema.validateAsync(req.body);
  } catch (error) {
    const [{ type }] = error.details;
    if (type === 'object.missing') {
      return res.status(400).json({ message: 'missing fields favorite' });
    }
    return res.status(400).json({ message: error.message });
  }
  next();
};

export const validateId = async (req, res, next) => {
  if (!Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ObjectId' });
  }
  next();
};

export const validateQuery = async (req, res, next) => {
  try {
    await querySchema.validateAsync(req.query);
  } catch (error) {
    return res
      .status(400)
      .json({ message: `Field ${error.message.replace(/"/g, '')}` });
  }
  next();
};

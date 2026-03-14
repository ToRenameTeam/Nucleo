import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { delegationService } from '../services/index.js';
import { success } from './utils/response.js';
import { handleRouteError } from './utils/http-helpers.js';
import {
  delegationStatusSchema,
  nonEmptyTrimmedStringSchema,
  optionalNonEmptyTrimmedStringSchema,
  validateWithSchema,
} from './validation.js';

const router = Router();

const DELEGATION_ERROR_RULES = [
  { statusCode: 404, messageEquals: 'Delegation not found' },
  { statusCode: 404, messageIncludes: 'not found' },
  { statusCode: 409, messageIncludes: 'already exists' },
  { statusCode: 403, messageIncludes: 'not authorized' },
  { statusCode: 400, messageIncludes: 'Cannot' },
  { statusCode: 400, messageIncludes: 'Invalid' },
];

const createDelegationBodySchema = z
  .object({
    delegatingUserId: nonEmptyTrimmedStringSchema,
    delegatorUserId: nonEmptyTrimmedStringSchema,
  })
  .refine(
    function (data) {
      return data.delegatingUserId !== data.delegatorUserId;
    },
    {
      message: 'delegatingUserId and delegatorUserId must be different',
      path: ['delegatorUserId'],
    }
  );

const delegationIdParamsSchema = z.object({
  delegationId: nonEmptyTrimmedStringSchema,
});

const statusQuerySchema = z.object({
  status: delegationStatusSchema.optional(),
});

const userIdRequiredQuerySchema = z.object({
  userId: nonEmptyTrimmedStringSchema,
});

const userIdBodySchema = z.object({
  userId: nonEmptyTrimmedStringSchema,
});

const userDelegationQuerySchema = z.object({
  userId: nonEmptyTrimmedStringSchema,
  status: optionalNonEmptyTrimmedStringSchema,
});

// Create a new delegation
router.post('/', async (req: Request, res: Response) => {
  try {
    const { delegatingUserId, delegatorUserId } = validateWithSchema(
      createDelegationBodySchema,
      req.body,
      'create delegation body'
    );

    const delegation = await delegationService.createDelegation({
      delegatingUserId,
      delegatorUserId,
    });

    return success(res, delegation, 201);
  } catch (err) {
    return handleRouteError(res, err, 'Create delegation error', DELEGATION_ERROR_RULES);
  }
});

// Get all delegations
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = validateWithSchema(statusQuerySchema, req.query, 'delegation query');

    const result = await delegationService.getAllDelegations(status);
    return success(res, result);
  } catch (err) {
    return handleRouteError(res, err, 'Get all delegations error', DELEGATION_ERROR_RULES);
  }
});

// Get delegations received by user (where user must accept/decline)
router.get('/received', async (req: Request, res: Response) => {
  try {
    const { userId, status } = validateWithSchema(
      userDelegationQuerySchema,
      req.query,
      'received delegations query'
    );

    const result = await delegationService.getDelegationsForUser(userId, 'delegating', status);
    return success(res, result);
  } catch (err) {
    return handleRouteError(res, err, 'List received delegations error', DELEGATION_ERROR_RULES);
  }
});

// Get delegations sent by user (where user is the data owner)
router.get('/sent', async (req: Request, res: Response) => {
  try {
    const { userId, status } = validateWithSchema(
      userDelegationQuerySchema,
      req.query,
      'sent delegations query'
    );

    const result = await delegationService.getDelegationsForUser(userId, 'delegator', status);
    return success(res, result);
  } catch (err) {
    return handleRouteError(res, err, 'List sent delegations error', DELEGATION_ERROR_RULES);
  }
});

// Get active delegations where user can operate for others
router.get('/active-for-user', async (req: Request, res: Response) => {
  try {
    const { userId } = validateWithSchema(
      userIdRequiredQuerySchema,
      req.query,
      'active delegations query'
    );

    const result = await delegationService.getActiveDelegationsForDelegatingUser(userId);
    return success(res, result);
  } catch (err) {
    return handleRouteError(res, err, 'Get active delegations error', DELEGATION_ERROR_RULES);
  }
});

// Get delegation by ID
router.get('/:delegationId', async (req: Request, res: Response) => {
  try {
    const { delegationId } = validateWithSchema(
      delegationIdParamsSchema,
      req.params,
      'delegation params'
    );

    const delegation = await delegationService.getDelegationById(delegationId);
    return success(res, delegation);
  } catch (err) {
    return handleRouteError(res, err, 'Get delegation error', DELEGATION_ERROR_RULES);
  }
});

// Accept a delegation
router.put('/:delegationId/accept', async (req: Request, res: Response) => {
  try {
    const { delegationId } = validateWithSchema(
      delegationIdParamsSchema,
      req.params,
      'accept delegation params'
    );
    const { userId } = validateWithSchema(userIdBodySchema, req.body, 'accept delegation body');

    const result = await delegationService.acceptDelegation(delegationId, userId);
    return success(res, result);
  } catch (err) {
    return handleRouteError(res, err, 'Accept delegation error', DELEGATION_ERROR_RULES);
  }
});

// Decline a delegation
router.put('/:delegationId/decline', async (req: Request, res: Response) => {
  try {
    const { delegationId } = validateWithSchema(
      delegationIdParamsSchema,
      req.params,
      'decline delegation params'
    );
    const { userId } = validateWithSchema(userIdBodySchema, req.body, 'decline delegation body');

    const result = await delegationService.declineDelegation(delegationId, userId);
    return success(res, result);
  } catch (err) {
    return handleRouteError(res, err, 'Decline delegation error', DELEGATION_ERROR_RULES);
  }
});

// Delete a delegation
router.delete('/:delegationId', async (req: Request, res: Response) => {
  try {
    const { delegationId } = validateWithSchema(
      delegationIdParamsSchema,
      req.params,
      'delete delegation params'
    );
    const { userId } = validateWithSchema(
      userIdRequiredQuerySchema,
      req.query,
      'delete delegation query'
    );

    const result = await delegationService.deleteDelegation(delegationId, userId);
    return success(res, result);
  } catch (err) {
    return handleRouteError(res, err, 'Delete delegation error', DELEGATION_ERROR_RULES);
  }
});

export default router;

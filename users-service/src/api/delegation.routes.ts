import { Router, Request, Response } from 'express';
import { delegationService } from '../services/index.js';
import { success, error } from './utils/response.js';
import {
  getRequiredQueryString,
  handleRouteError,
  isNonEmptyString,
} from './utils/http-helpers.js';

const router = Router();

const DELEGATION_ERROR_RULES = [
  { statusCode: 404, messageEquals: 'Delegation not found' },
  { statusCode: 404, messageIncludes: 'not found' },
  { statusCode: 409, messageIncludes: 'already exists' },
  { statusCode: 403, messageIncludes: 'not authorized' },
  { statusCode: 400, messageIncludes: 'Cannot' },
];

// Create a new delegation
router.post('/', async (req: Request, res: Response) => {
  try {
    const { delegatingUserId, delegatorUserId } = req.body;

    if (!delegatingUserId || !delegatorUserId) {
      return error(res, 'delegatingUserId and delegatorUserId are required', 400);
    }
    if (delegatingUserId === delegatorUserId) {
      return error(res, 'cannot delegate to yourself', 400);
    }

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
    const status = req.query.status as string;

    const result = await delegationService.getAllDelegations(status);
    return success(res, result);
  } catch (err) {
    return handleRouteError(res, err, 'Get all delegations error', DELEGATION_ERROR_RULES);
  }
});

// Get delegations received by user (where user must accept/decline)
router.get('/received', async (req: Request, res: Response) => {
  try {
    const userId = getRequiredQueryString(
      req,
      res,
      'userId',
      'userId is required as query parameter'
    );
    if (!userId) {
      return;
    }

    const status = req.query.status as string | undefined;

    const result = await delegationService.getDelegationsForUser(userId, 'delegating', status);
    return success(res, result);
  } catch (err) {
    return handleRouteError(res, err, 'List received delegations error', DELEGATION_ERROR_RULES);
  }
});

// Get delegations sent by user (where user is the data owner)
router.get('/sent', async (req: Request, res: Response) => {
  try {
    const userId = getRequiredQueryString(
      req,
      res,
      'userId',
      'userId is required as query parameter'
    );
    if (!userId) {
      return;
    }

    const status = req.query.status as string | undefined;

    const result = await delegationService.getDelegationsForUser(userId, 'delegator', status);
    return success(res, result);
  } catch (err) {
    return handleRouteError(res, err, 'List sent delegations error', DELEGATION_ERROR_RULES);
  }
});

// Get active delegations where user can operate for others
router.get('/active-for-user', async (req: Request, res: Response) => {
  try {
    const userId = getRequiredQueryString(
      req,
      res,
      'userId',
      'userId is required as query parameter'
    );
    if (!userId) {
      return;
    }

    const result = await delegationService.getActiveDelegationsForDelegatingUser(userId);
    return success(res, result);
  } catch (err) {
    return handleRouteError(res, err, 'Get active delegations error', DELEGATION_ERROR_RULES);
  }
});

// Get delegation by ID
router.get('/:delegationId', async (req: Request, res: Response) => {
  try {
    const { delegationId } = req.params;

    if (!isNonEmptyString(delegationId)) {
      return error(res, 'Invalid delegation ID', 400);
    }

    const delegation = await delegationService.getDelegationById(delegationId);
    return success(res, delegation);
  } catch (err) {
    return handleRouteError(res, err, 'Get delegation error', DELEGATION_ERROR_RULES);
  }
});

// Accept a delegation
router.put('/:delegationId/accept', async (req: Request, res: Response) => {
  try {
    const { delegationId } = req.params;
    const { userId } = req.body;

    if (!isNonEmptyString(delegationId)) {
      return error(res, 'Invalid delegation ID', 400);
    }

    if (!isNonEmptyString(userId)) {
      return error(res, 'userId is required in request body', 400);
    }

    const result = await delegationService.acceptDelegation(delegationId, userId);
    return success(res, result);
  } catch (err) {
    return handleRouteError(res, err, 'Accept delegation error', DELEGATION_ERROR_RULES);
  }
});

// Decline a delegation
router.put('/:delegationId/decline', async (req: Request, res: Response) => {
  try {
    const { delegationId } = req.params;
    const { userId } = req.body;

    if (!isNonEmptyString(delegationId)) {
      return error(res, 'Invalid delegation ID', 400);
    }

    if (!isNonEmptyString(userId)) {
      return error(res, 'userId is required in request body', 400);
    }

    const result = await delegationService.declineDelegation(delegationId, userId);
    return success(res, result);
  } catch (err) {
    return handleRouteError(res, err, 'Decline delegation error', DELEGATION_ERROR_RULES);
  }
});

// Delete a delegation
router.delete('/:delegationId', async (req: Request, res: Response) => {
  try {
    const { delegationId } = req.params;
    const userId = getRequiredQueryString(
      req,
      res,
      'userId',
      'userId is required as query parameter'
    );

    if (!isNonEmptyString(delegationId)) {
      return error(res, 'Invalid delegation ID', 400);
    }

    if (!userId) {
      return;
    }

    const result = await delegationService.deleteDelegation(delegationId, userId);
    return success(res, result);
  } catch (err) {
    return handleRouteError(res, err, 'Delete delegation error', DELEGATION_ERROR_RULES);
  }
});

export default router;

export class AppError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

// User errors
export class UserValidationError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class UserConflictError extends AppError {
    constructor(message: string) {
        super(message, 409);
    }
}

export class UserNotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404);
    }
}

// Delegation errors
export class DelegationValidationError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class DelegationConflictError extends AppError {
    constructor(message: string) {
        super(message, 409);
    }
}

export class DelegationNotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404);
    }
}

export class DelegationForbiddenError extends AppError {
    constructor(message: string) {
        super(message, 403);
    }
}

// Auth errors
export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401);
    }
}

// Generic (mantieni quelli esistenti per retrocompatibilità)
export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 404);
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string) {
        super(message, 403);
    }
}
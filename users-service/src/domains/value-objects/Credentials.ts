import { FiscalCode } from './FiscalCode.js';
import crypto from 'crypto';

export class Credentials {
    private readonly _username: FiscalCode;
    private readonly _passwordHash: string;

    private constructor(username: FiscalCode, passwordHash: string) {
        this._username = username;
        this._passwordHash = passwordHash;
    }

    static create(fiscalCode: FiscalCode, password: string): Credentials {
        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        return new Credentials(fiscalCode, passwordHash);
    }

    static reconstitute(fiscalCode: FiscalCode, passwordHash: string): Credentials {
        return new Credentials(fiscalCode, passwordHash);
    }

    equals(other: Credentials): boolean {
        return (
            this._username.equals(other._username) &&
            this._passwordHash === other._passwordHash
        );
    }

    get passwordHash(): string {
        return this._passwordHash;
    }

    async verify(password: string): Promise<boolean> {
        const inputHash = crypto.createHash('sha256').update(password).digest('hex');
        return this._passwordHash === inputHash;
    }
}
import { FiscalCode } from "./value-objects/FiscalCode.js";
import { ProfileInfo } from "./value-objects/ProfileInfo.js";
import { Credentials } from "./value-objects/Credentials.js";
import type { UUID } from "crypto";

export class User {
    private readonly _userId: UUID;
    private readonly _fiscalCode: FiscalCode;
    private _credentials: Credentials;
    private _profileInfo: ProfileInfo;

    private constructor(userId: UUID, fiscalCode: FiscalCode, credentials: Credentials, profileInfo: ProfileInfo) {
        this._userId = userId;
        this._fiscalCode = fiscalCode;
        this._credentials = credentials;
        this._profileInfo = profileInfo;
    }

    static create(userId: UUID, fiscalCode: FiscalCode, credentials: Credentials, profileInfo: ProfileInfo): User {
        return new User(userId, fiscalCode, credentials, profileInfo);
    }

    static reconstitute(
        userId: UUID,
        fiscalCode: FiscalCode,
        credentials: Credentials,
        profileInfo: ProfileInfo,
    ): User {
        return new User(userId, fiscalCode, credentials, profileInfo);
    }

    async authenticate(password: string): Promise<boolean> {
        return this._credentials.verify(password);
    }

    get fiscalCode(): FiscalCode {
        return this._fiscalCode;
    }

    get credentials(): Credentials {
        return this._credentials;
    }

    get profileInfo(): ProfileInfo {
        return this._profileInfo;
    }

    get userId(): string {
        return this._userId;
    }

}
import type { User } from '../../domains/User.js';

export interface UserData {
    userId: string;
    fiscalCode: string;
    passwordHash: string;
    name: string;
    lastName: string;
    dateOfBirth: Date;
}

export interface IUserRepository {
    findByFiscalCode(fiscalCode: string): Promise<UserData | null>;
    findById(userId: string): Promise<UserData | null>;
    findAll(): Promise<{users: UserData[]}>;
    save(user: User): Promise<void>;
    create(user: User): Promise<void>
    delete(userId: string): Promise<void>;
}
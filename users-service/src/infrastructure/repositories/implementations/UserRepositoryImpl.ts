import { UserModel } from '../../models/UserModel.js';
import type { User } from '../../../domains/User.js';
import {IUserRepository, UserData} from "../IUserRepository.js";

export class UserRepositoryImpl implements IUserRepository {
    async findById(userId: string): Promise<UserData | null> {
        const user = await UserModel.findOne({ userId });

        if (!user) return null;

        return this.toUserData(user);
    }

    async findByFiscalCode(fiscalCode: string): Promise<UserData | null> {
        const user = await UserModel
            .findOne({ fiscalCode: fiscalCode.toUpperCase() });

        if (!user) return null;

        return this.toUserData(user);
    }

    async findAll(): Promise<{ users: UserData[]}> {

        const users= await UserModel.find();

        return {
            users: users.map(user => ({
                userId: user.userId,
                fiscalCode: user.fiscalCode,
                passwordHash: user.passwordHash,
                name: user.name,
                lastName: user.lastName,
                dateOfBirth: user.dateOfBirth,
            }))
        };
    }


    async save(user: User): Promise<void> {
        const update = {
            fiscalCode: user.fiscalCode.value,
            passwordHash: user.credentials.passwordHash,
            name: user.profileInfo.name,
            lastName: user.profileInfo.lastName,
            dateOfBirth: user.profileInfo.dateOfBirth,
        };

        const result = await UserModel.findOneAndUpdate(
            { userId: user.userId },
            update,
            { new: false }
        );

        if (!result) {
            throw new Error(
                `User with id ${user.userId} does not exist`
            );
        }
    }

    async create(user: User): Promise<void> {
        await UserModel.create({
            userId: user.userId,
            fiscalCode: user.fiscalCode.value,
            passwordHash: user.credentials.passwordHash,
            name: user.profileInfo.name,
            lastName: user.profileInfo.lastName,
            dateOfBirth: user.profileInfo.dateOfBirth,
        });
    }

    async delete(userId: string): Promise<void> {
        await UserModel.findOneAndDelete({ userId });
    }

    private toUserData(user: any): UserData {
        return {
            userId: user.userId,
            fiscalCode: user.fiscalCode,
            passwordHash: user.passwordHash,
            name: user.name,
            lastName: user.lastName,
            dateOfBirth: user.dateOfBirth,
        };
    }
}
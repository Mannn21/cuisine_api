import { RoleUser } from '../../lib/roleUsers';

export interface UserInterface {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    address: string;
    role: RoleUser;
    createdAt: Date;
    birthDate?: Date;
    phoneNumber?: string;
    profileImageUrl?: string;
}

export interface PublicUserInterface {
    id: string;
    name: string;
    email: string;
    address: string;
    createdAt: Date;
    birthDate?: Date;
    phoneNumber?: string;
    profileImageUrl?: string;
}

export interface TokenUserDataInterface {
    id: string;
    name: string;
    email: string;
}
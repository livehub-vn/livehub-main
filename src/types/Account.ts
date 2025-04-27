// enum
export enum AccountRole {
    BUYER = 'BUYER',
    SUPPLIER = 'SUPPLIER',
    ADMIN = 'ADMIN',
}

export type AccountMetadata = {
    [x: string]: string;
    fullName: string;
    role: AccountRole;
    taxId: string;
    address: string;
}

export interface Account {
    phone: any;
    user_metadata: any;
    id: string;
    email: string;
    metadata: AccountMetadata;
    created_at: string;
}

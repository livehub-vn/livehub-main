// enum
export enum AccountRole {
    BUYER = 'BUYER',
    SUPPLIER = 'SUPPLIER',
    ADMIN = 'ADMIN',
}

export type AccountMetadata = {
    fullName: string;
    role: AccountRole;
    taxId: string;
    address: string;
}


export type Account = {
    id: string;
    email: string;
    metadata: AccountMetadata;
    created_at: string;
}

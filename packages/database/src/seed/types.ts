import { UUID } from "node:crypto";

export interface SeedUser {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    role: string;
}

export interface SeedModule {
    id: UUID;
    title: string;
}

export interface SeedTutorial {
    id: UUID;
    moduleId: UUID;
    title: string;
    content: string;
    orderIndex: number;
}

export interface SeedLab {
    id: UUID;
    moduleId: UUID;
    title: string;
    orderIndex: number;
}
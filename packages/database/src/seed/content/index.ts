import { UUID } from "node:crypto";
import { SeedLab, SeedModule, SeedTutorial } from "../types";

export const SEED_MODULES = {
    module1: {
        id: '00000000-0000-0000-0001-000000000001' as UUID,
    },
} as const;

export const seedModules: SeedModule[] = [
    {
        id: SEED_MODULES.module1.id,
        title: 'Demo Module',
    },
];

export const seedTutorials: SeedTutorial[] = [
    {
        id: '00000000-0000-0000-0002-000000000001' as UUID,
        moduleId: SEED_MODULES.module1.id,
        title: 'Demo Tutorial 1',
        content: '# Demo Tutorial',
        orderIndex: 1,
    },
    {
        id: '00000000-0000-0000-0002-000000000002' as UUID,
        moduleId: SEED_MODULES.module1.id,
        title: 'Demo Tutorial 2',
        content: '# Demo Tutorial 2',
        orderIndex: 2,
    },
];

export const seedLabs: SeedLab[] = [
    {
        id: '00000000-0000-0000-0003-000000000001' as UUID,
        moduleId: SEED_MODULES.module1.id,
        title: 'Demo Lab 1',
        orderIndex: 1,
    }
]
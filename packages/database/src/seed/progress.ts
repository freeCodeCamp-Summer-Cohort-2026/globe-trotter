import { SEED_USERS } from "./users";
import { SEED_MODULES, seedTutorials, seedLabs } from "./content/index";

const tutorial1Id = seedTutorials[0]?.id;
const tutorial2Id = seedTutorials[1]?.id;
const lab1Id = seedLabs[0]?.id;

export const seedProgress = [
    {
        userId: SEED_USERS.learner.id,
        moduleId: SEED_MODULES.module1.id,
        tutorialId: tutorial1Id,
        labId: null,
        status: 'completed' as const,
    },
    {
        userId: SEED_USERS.learner.id,
        moduleId: SEED_MODULES.module1.id,
        tutorialId: tutorial2Id,
        labId: null,
        status: 'in_progress' as const,
    },
    {
        userId: SEED_USERS.learner.id,
        moduleId: SEED_MODULES.module1.id,
        tutorialId: null,
        labId: lab1Id,
        status: 'not_started' as const,
    }
]
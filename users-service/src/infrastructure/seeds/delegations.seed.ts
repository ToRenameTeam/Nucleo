import { USER_IDS } from './users.seed.js';

interface DelegationSeed {
    delegationId: string;
    delegatingUserId: string;
    delegatorUserId: string;
    status: 'Pending' | 'Active' | 'Declined' | 'Deleted';
}

// Hardcoded delegation IDs for consistency
export const delegationSeeds: DelegationSeed[] = [
    // Giulia delegata da Mario (ACTIVE)
    {
        delegationId: 'd1e1a1b1-1111-4111-a111-111111111111',
        delegatingUserId: USER_IDS.GIULIA_BIANCHI,
        delegatorUserId: USER_IDS.MARIO_ROSSI,
        status: 'Active',
    },
    // Giulia delegata da Maria (ACTIVE)
    {
        delegationId: 'd2e2a2b2-2222-4222-a222-222222222222',
        delegatingUserId: USER_IDS.GIULIA_BIANCHI,
        delegatorUserId: USER_IDS.MARIA_CONTI,
        status: 'Active',
    },
    // Luca delegato su Alessandro (ACTIVE)
    {
        delegationId: 'd3e3a3b3-3333-4333-a333-333333333333',
        delegatingUserId: USER_IDS.LUCA_ROMANO,
        delegatorUserId: USER_IDS.ALESSANDRO_RICCI,
        status: 'Active',
    },
    // Sara delegata su Alessandro (ACTIVE)
    {
        delegationId: 'd4e4a4b4-4444-4444-a444-444444444444',
        delegatingUserId: USER_IDS.SARA_COLOMBO,
        delegatorUserId: USER_IDS.ALESSANDRO_RICCI,
        status: 'Active',
    },
];
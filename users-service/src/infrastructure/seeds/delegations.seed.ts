import crypto from 'crypto';
import { USER_IDS } from './users.seed.js';

interface DelegationSeed {
    delegationId: string;
    delegatingUserId: string;
    delegatorUserId: string;
    status: 'Pending' | 'Active' | 'Declined' | 'Deleted';
}

const generateUUID = () => crypto.randomUUID();

export const delegationSeeds: DelegationSeed[] = [
    {
        delegationId: generateUUID(),
        delegatingUserId: USER_IDS.GIULIA_BIANCHI,
        delegatorUserId: USER_IDS.MARIO_ROSSI,
        status: 'Active',
    },
    {
        delegationId: generateUUID(),
        delegatingUserId: USER_IDS.LUCA_ROMANO,
        delegatorUserId: USER_IDS.ELENA_FERRARI,
        status: 'Pending',
    },
    {
        delegationId: generateUUID(),
        delegatingUserId: USER_IDS.ANNA_MARINO,
        delegatorUserId: USER_IDS.ALESSANDRO_RICCI,
        status: 'Active',
    },
    {
        delegationId: generateUUID(),
        delegatingUserId: USER_IDS.CHIARA_BRUNO,
        delegatorUserId: USER_IDS.ROBERTO_GALLO,
        status: 'Declined',
    },
    {
        delegationId: generateUUID(),
        delegatingUserId: USER_IDS.GIULIA_BIANCHI,
        delegatorUserId: USER_IDS.MARIA_CONTI,
        status: 'Active',
    },
    {
        delegationId: generateUUID(),
        delegatingUserId: USER_IDS.MARIO_ROSSI,
        delegatorUserId: USER_IDS.VALENTINA_MANCINI,
        status: 'Pending',
    },
    {
        delegationId: generateUUID(),
        delegatingUserId: USER_IDS.ELENA_FERRARI,
        delegatorUserId: USER_IDS.ROBERTO_GALLO,
        status: 'Deleted',
    },
    {
        delegationId: generateUUID(),
        delegatingUserId: USER_IDS.SARA_COLOMBO,
        delegatorUserId: USER_IDS.LUCA_ROMANO,
        status: 'Active',
    },
    {
        delegationId: generateUUID(),
        delegatingUserId: USER_IDS.ANNA_MARINO,
        delegatorUserId: USER_IDS.CHIARA_BRUNO,
        status: 'Pending',
    },
    {
        delegationId: generateUUID(),
        delegatingUserId: USER_IDS.MARIO_ROSSI,
        delegatorUserId: USER_IDS.ELENA_FERRARI,
        status: 'Declined',
    },
    {
        delegationId: generateUUID(),
        delegatingUserId: USER_IDS.LUCA_ROMANO,
        delegatorUserId: USER_IDS.ALESSANDRO_RICCI,
        status: 'Active',
    },
    {
        delegationId: generateUUID(),
        delegatingUserId: USER_IDS.CHIARA_BRUNO,
        delegatorUserId: USER_IDS.VALENTINA_MANCINI,
        status: 'Deleted',
    },
    {
        delegationId: generateUUID(),
        delegatingUserId: USER_IDS.VALENTINA_MANCINI,
        delegatorUserId: USER_IDS.ROBERTO_GALLO,
        status: 'Pending',
    },
    {
        delegationId: generateUUID(),
        delegatingUserId: USER_IDS.ALESSANDRO_RICCI,
        delegatorUserId: USER_IDS.MARIA_CONTI,
        status: 'Active',
    },
    {
        delegationId: generateUUID(),
        delegatingUserId: USER_IDS.ANNA_MARINO,
        delegatorUserId: USER_IDS.LUCA_ROMANO,
        status: 'Declined',
    },
];
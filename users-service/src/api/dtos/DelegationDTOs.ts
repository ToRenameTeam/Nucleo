import type {Doctor, Patient, User} from "../../domains/index.js";

export interface DelegationResponse {
    delegationId: string;
    delegatingUserId: string;   
    delegatorUserId: string;    
    status: string;             
}

export interface DelegationStatusUpdateResponse {
    delegationId: string;
    status: string;
}
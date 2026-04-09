import type { ActiveProfile } from '../../services/authenticated-user.factory.js';

export interface JwtClaims {
  userId: string;
  fiscalCode: string;
  activeProfile: ActiveProfile;
  iat: number;
  exp: number;
  iss: string;
}

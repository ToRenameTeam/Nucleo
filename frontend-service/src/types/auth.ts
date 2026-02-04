export interface Profile {
  id: string
  name: string
  lastName: string
  fiscalCode: string
  dateOfBirth: string
}

export interface UserData {
  userId: string
  fiscalCode: string
  name: string
  lastName: string
  dateOfBirth: string
  patient?: {
    userId: string
  }
  doctor?: {
    userId: string
    medicalLicenseNumber: string
    specializations: string[]
  }
}

export interface AuthenticatedUser extends UserData {
  activeProfile: 'PATIENT' | 'DOCTOR'
}

export interface LoginRequest {
  fiscalCode: string
  password: string
}

export interface LoginResponse extends UserData {
  activeProfile?: 'PATIENT' | 'DOCTOR'
  requiresProfileSelection?: boolean
}

export interface SelectPatientProfileRequest {
  userId: string
  selectedProfile: 'PATIENT' | 'DOCTOR'
}

export interface ApiError {
  message: string
  statusCode: number
}

class AuthApiError extends Error {
  statusCode: number
  
  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
    this.name = 'AuthApiError'
  }
}
export { AuthApiError }

export interface SearchUserByFiscalCodeResponse {
    userId: string
    fiscalCode: string
    name: string
    lastName: string
    dateOfBirth: string
}

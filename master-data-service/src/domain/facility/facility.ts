export interface Facility {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly address: string;
  readonly city: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

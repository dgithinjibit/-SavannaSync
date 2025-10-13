
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  SCHOOL_HEAD = 'SCHOOL_HEAD',
  COUNTY_OFFICER = 'COUNTY_OFFICER',
  PARENT = 'PARENT',
  MINISTRY_OFFICIAL = 'MINISTRY_OFFICIAL'
}

export interface UserData {
  uid: string;
  email: string | undefined;
  role: UserRole;
  schoolId: string;
  county: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface School {
  id: string;
  name: string;
  county: string;
  created_at: string;
}
import type { Subject } from '../../../shared/types/common';

export type AcademicTopic = { id: string; title: string; position: number };
export type AcademicModule = { id: string; title: string; position: number; topics: AcademicTopic[] };
export type AcademicSubject = Subject & {
  description: string;
  university: string;
  department: string;
  program: string;
  semester: string;
  moduleItems: AcademicModule[];
};

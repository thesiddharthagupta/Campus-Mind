export type ModerationAction =
  | 'approve_material'
  | 'reject_material'
  | 'remove_material'
  | 'resolve_report'
  | 'dismiss_report';

export type ModerationMaterial = {
  id: string;
  title: string;
  description: string;
  resourceType: string;
  storagePath: string | null;
  byteSize: number | null;
  createdAt: string;
  status: string;
  subject: string;
};

export type ModerationReport = {
  id: string;
  materialId: string;
  reason: string;
  details: string;
  status: string;
  createdAt: string;
  material: ModerationMaterial;
};

export type ModerationQueue = {
  materials: ModerationMaterial[];
  reports: ModerationReport[];
};

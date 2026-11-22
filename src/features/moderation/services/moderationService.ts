import { supabase } from '../../../lib/supabaseClient';

type Relation<T> = T | T[] | null;
type SubjectRelation = Relation<{ name: string }>;
type MaterialRow = {
  id: string;
  title: string;
  description: string;
  resource_type: string;
  storage_path: string | null;
  byte_size: number | null;
  created_at: string;
  status?: string;
  subject: SubjectRelation;
};

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

export type ModerationQueue = { materials: ModerationMaterial[]; reports: ModerationReport[] };
export type ModerationAction = 'approve_material' | 'reject_material' | 'remove_material' | 'resolve_report' | 'dismiss_report';

function one<T>(value: Relation<T>): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function mapMaterial(row: MaterialRow): ModerationMaterial {
  return {
    id: row.id,
    title: row.title,
    description: row.description || 'No description provided.',
    resourceType: row.resource_type,
    storagePath: row.storage_path,
    byteSize: row.byte_size,
    createdAt: row.created_at,
    status: row.status ?? 'pending',
    subject: one(row.subject)?.name ?? 'Course material',
  };
}

export async function loadModerationQueue(): Promise<ModerationQueue> {
  if (!supabase) throw new Error('Moderator review requires a connected Supabase project.');
  const [materialsResult, reportsResult] = await Promise.all([
    supabase.from('materials')
      .select('id,title,description,resource_type,storage_path,byte_size,created_at,status,subject:subjects(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
    supabase.from('reports')
      .select('id,material_id,reason,details,status,created_at,material:materials!reports_material_id_fkey(id,title,description,resource_type,storage_path,byte_size,created_at,status,subject:subjects(name))')
      .in('status', ['open', 'reviewing'])
      .order('created_at', { ascending: true }),
  ]);

  if (materialsResult.error) throw new Error(materialsResult.error.message);
  if (reportsResult.error) throw new Error(reportsResult.error.message);

  const materials = (materialsResult.data ?? []).map((row) => mapMaterial(row as MaterialRow));
  const reports = (reportsResult.data ?? []).flatMap((row) => {
    const materialRow = one(row.material as Relation<MaterialRow>);
    if (!materialRow) return [];
    return [{
      id: row.id,
      materialId: row.material_id,
      reason: row.reason,
      details: row.details ?? '',
      status: row.status,
      createdAt: row.created_at,
      material: mapMaterial(materialRow),
    }];
  });
  return { materials, reports };
}

export async function performModerationAction(action: ModerationAction, materialId?: string, reportId?: string): Promise<void> {
  if (!supabase) throw new Error('Moderator review requires a connected Supabase project.');
  const { error } = await supabase.rpc('moderator_review_item', {
    p_action: action,
    p_material_id: materialId ?? null,
    p_report_id: reportId ?? null,
  });
  if (error) throw new Error(error.message);
}

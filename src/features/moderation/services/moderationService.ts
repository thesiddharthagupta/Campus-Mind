import { supabase } from '../../../lib/supabaseClient';
import type { ModerationAction, ModerationMaterial, ModerationQueue, ModerationReport } from '../types/moderation.types';

export type { ModerationAction, ModerationMaterial, ModerationQueue, ModerationReport };

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
  if (!supabase) return { materials: [], reports: [] };

  const [{ data: pendingMaterials, error: matError }, { data: openReports, error: repError }] = await Promise.all([
    supabase
      .from('materials')
      .select('id,title,description,resource_type,storage_path,byte_size,created_at,status,subject:subjects(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
    supabase
      .from('reports')
      .select('id,material_id,reason,details,status,created_at,material:materials(id,title,description,resource_type,storage_path,byte_size,created_at,status,subject:subjects(name))')
      .in('status', ['open', 'reviewing'])
      .order('created_at', { ascending: true }),
  ]);

  if (matError) throw new Error(matError.message);
  if (repError) throw new Error(repError.message);

  const materials = (pendingMaterials ?? []).map((row) => mapMaterial(row as MaterialRow));
  const reports: ModerationReport[] = (openReports ?? []).map((row) => {
    const rawMaterial = one(row.material as Relation<MaterialRow>);
    return {
      id: row.id,
      materialId: row.material_id,
      reason: row.reason,
      details: row.details,
      status: row.status,
      createdAt: row.created_at,
      material: rawMaterial ? mapMaterial(rawMaterial) : {
        id: row.material_id,
        title: 'Unknown material',
        description: '',
        resourceType: 'notes',
        storagePath: null,
        byteSize: null,
        createdAt: row.created_at,
        status: 'removed',
        subject: 'Course material',
      },
    };
  });

  return { materials, reports };
}

export async function performModerationAction(action: ModerationAction, materialId?: string, reportId?: string): Promise<void> {
  if (!supabase) throw new Error('Moderation service is not connected.');

  const { error } = await supabase.rpc('moderator_review_item', {
    p_action: action,
    p_material_id: materialId ?? null,
    p_report_id: reportId ?? null,
  });

  if (error) throw new Error(error.message);
}

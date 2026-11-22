-- Let moderators inspect private uploads and make reviewed status changes through a guarded RPC.
create policy "Moderators can preview study material files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'study-materials'
    and public.current_app_role() in ('moderator', 'admin')
  );

create or replace function public.moderator_review_item(
  p_action text,
  p_material_id uuid default null,
  p_report_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Authentication required';
  end if;
  if public.current_app_role() not in ('moderator', 'admin') then
    raise exception 'Moderator access required';
  end if;

  case p_action
    when 'approve_material' then
      update public.materials set status = 'published', updated_at = now()
      where id = p_material_id and status = 'pending';
      if not found then raise exception 'This material is no longer pending review'; end if;
    when 'reject_material' then
      update public.materials set status = 'rejected', updated_at = now()
      where id = p_material_id and status = 'pending';
      if not found then raise exception 'This material is no longer pending review'; end if;
    when 'remove_material' then
      update public.materials set status = 'removed', updated_at = now()
      where id = p_material_id and status in ('pending', 'published');
      if not found then raise exception 'This material is no longer available for removal'; end if;
      if p_report_id is not null then
        update public.reports set status = 'resolved', reviewed_by = v_user, reviewed_at = now()
        where id = p_report_id and material_id = p_material_id and status in ('open', 'reviewing');
        if not found then raise exception 'This report is no longer open'; end if;
      end if;
    when 'resolve_report' then
      update public.reports set status = 'resolved', reviewed_by = v_user, reviewed_at = now()
      where id = p_report_id and status in ('open', 'reviewing');
      if not found then raise exception 'This report is no longer open'; end if;
    when 'dismiss_report' then
      update public.reports set status = 'dismissed', reviewed_by = v_user, reviewed_at = now()
      where id = p_report_id and status in ('open', 'reviewing');
      if not found then raise exception 'This report is no longer open'; end if;
    else
      raise exception 'Unsupported moderator action';
  end case;

  insert into public.audit_logs (actor_id, action, entity_type, entity_id, details)
  values (
    v_user,
    'moderation.' || p_action,
    case when p_material_id is not null then 'material' else 'report' end,
    coalesce(p_material_id, p_report_id),
    jsonb_build_object('material_id', p_material_id, 'report_id', p_report_id)
  );
end;
$$;

revoke all on function public.moderator_review_item(text, uuid, uuid) from public;
grant execute on function public.moderator_review_item(text, uuid, uuid) to authenticated;

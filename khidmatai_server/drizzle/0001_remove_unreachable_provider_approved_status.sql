-- The "approve" review action transitions a provider profile straight to
-- "active" (see administration-types.ts). The "approved" status was never a
-- reachable intermediate state, so its presence in the status check constraint
-- was dead and inconsistent with provider_profiles_status_index expectations
-- and the documented workflow in 07_WORKFLOW_AND_TASKS.md.
do $$
begin
  if exists (select 1 from provider_profiles where status = 'approved') then
    raise exception 'Cannot remove the approved status: % provider_profiles row(s) still use it. Resolve them to active or another status before re-running this migration.',
      (select count(*) from provider_profiles where status = 'approved');
  end if;
end $$;

alter table provider_profiles drop constraint if exists provider_profiles_status_check;
alter table provider_profiles add constraint provider_profiles_status_check
  check (status in ('draft','submitted','under_review','changes_required','active','paused','rejected','suspended','removed'));

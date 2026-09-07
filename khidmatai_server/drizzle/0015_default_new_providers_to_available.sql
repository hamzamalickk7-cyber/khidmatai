alter table provider_profiles
  alter column is_available_for_new_jobs set default true;

-- Apply the new default to untouched draft profiles that were created before
-- this migration, without overriding an established provider's saved choice.
update provider_profiles
set is_available_for_new_jobs = true,
    updated_at = now()
where status = 'draft'
  and is_available_for_new_jobs = false
  and phone_number is null
  and professional_title is null
  and professional_bio is null;

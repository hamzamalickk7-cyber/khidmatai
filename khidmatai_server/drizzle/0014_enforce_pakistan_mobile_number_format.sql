alter table provider_profiles
  add constraint provider_profiles_phone_number_format_check
  check (phone_number is null or phone_number ~ '^([+]92[ ]?|92[ ]?|0)3[0-9]{2}[- ]?[0-9]{7}$');

alter table customer_profiles
  drop constraint if exists customer_profiles_phone_number_length_check;

alter table customer_profiles
  add constraint customer_profiles_phone_number_format_check
  check (phone_number is null or phone_number ~ '^([+]92[ ]?|92[ ]?|0)3[0-9]{2}[- ]?[0-9]{7}$');

alter table provider_references
  add constraint provider_references_phone_number_format_check
  check (phone_number is null or phone_number ~ '^([+]92[ ]?|92[ ]?|0)3[0-9]{2}[- ]?[0-9]{7}$');

import { postgresqlConnectionPool } from "../../database/database-connection.js";

export async function listActiveServiceCategories() {
  const result = await postgresqlConnectionPool.query({
    text: `select id, parent_category_id as "parentCategoryId", slug, display_name as "displayName",
      description, icon_identifier as "iconIdentifier", display_order as "displayOrder"
      from service_categories where is_active = true order by display_order, display_name`,
  });
  return result.rows;
}

export async function listActiveCountries() {
  const result = await postgresqlConnectionPool.query({
    text: `select id, iso_alpha_2_code as "isoAlpha2Code", iso_alpha_3_code as "isoAlpha3Code", name,
      international_calling_code as "internationalCallingCode", default_currency_code as "defaultCurrencyCode"
      from countries where is_active = true order by name`,
  });
  return result.rows;
}

export async function listActiveCities(countryCode: string, search: string | undefined, serviceableOnly: boolean) {
  const result = await postgresqlConnectionPool.query({
    text: `select cities.id, cities.name, cities.slug, cities.is_serviceable as "isServiceable",
      areas.name as "administrativeAreaName", countries.iso_alpha_2_code as "countryCode"
      from cities join countries on countries.id = cities.country_id
      left join country_administrative_areas areas on areas.id = cities.administrative_area_id
      where cities.is_active = true and countries.iso_alpha_2_code = $1
        and ($2::text is null or cities.name ilike '%' || $2 || '%')
        and ($3::boolean = false or cities.is_serviceable = true)
      order by cities.name limit 100`,
    values: [countryCode, search ?? null, serviceableOnly],
  });
  return result.rows;
}

interface ProviderDirectoryFilters { page: number; pageSize: number; search?: string; category?: string; city?: string }

const publicProviderEligibilitySql = `
  provider_profiles.status = 'active'
  and users.username is not null
  and users."deactivatedAt" is null
  and users.banned = false
  and provider_profiles.phone_number is not null
  and provider_profiles.professional_title is not null
  and provider_profiles.professional_bio is not null
  and exists (select 1 from provider_service_categories eligibility_categories where eligibility_categories.provider_profile_id = provider_profiles.id)
`;

export async function listApprovedPublicProviders(filters: ProviderDirectoryFilters) {
  const offset = (filters.page - 1) * filters.pageSize;
  const values = [filters.search ?? null, filters.category ?? null, filters.city ?? null, filters.pageSize, offset];
  const where = `${publicProviderEligibilitySql}
    and ($1::text is null or users.name ilike '%' || $1 || '%' or provider_profiles.professional_title ilike '%' || $1 || '%')
    and ($2::text is null or exists (select 1 from provider_service_categories pc join service_categories sc on sc.id = pc.category_id where pc.provider_profile_id = provider_profiles.id and sc.slug = $2))
    and ($3::text is null or provider_profiles.city ilike $3 or exists (select 1 from cities ci where ci.id = provider_profiles.city_id and ci.slug = $3))`;
  const [itemsResult, countResult] = await Promise.all([
    postgresqlConnectionPool.query({
      text: `select provider_profiles.id, users.username, users.name as "fullName", provider_profiles.professional_title as "professionalTitle",
        provider_profiles.professional_bio as "professionalBio", provider_profiles.years_of_experience as "yearsOfExperience",
        coalesce(cities.name, provider_profiles.city) as "cityName",
        provider_profiles.is_available_for_new_jobs as "isAvailableForNewJobs",
        (select secure_delivery_url from provider_profile_media_assets where provider_profile_id = provider_profiles.id and media_purpose = 'profile_image' order by created_at desc limit 1) as "profileImageUrl",
        (select secure_delivery_url from provider_profile_media_assets where provider_profile_id = provider_profiles.id and media_purpose = 'work_gallery' order by display_order, created_at desc limit 1) as "workImageUrl",
        coalesce((select json_agg(area_name order by area_name) from provider_service_areas where provider_profile_id = provider_profiles.id), '[]') as "serviceAreas",
        coalesce((select json_agg(json_build_object('slug', sc.slug, 'displayName', sc.display_name) order by sc.display_order)
          from provider_service_categories pc join service_categories sc on sc.id = pc.category_id where pc.provider_profile_id = provider_profiles.id), '[]') as categories
        from provider_profiles join "user" users on users.id = provider_profiles.user_id
        left join cities on cities.id = provider_profiles.city_id where ${where}
        order by provider_profiles.approved_at desc nulls last, provider_profiles.updated_at desc limit $4 offset $5`, values,
    }),
    postgresqlConnectionPool.query({
      text: `select count(*)::integer as total from provider_profiles join "user" users on users.id = provider_profiles.user_id where ${where}`,
      values: values.slice(0, 3),
    }),
  ]);
  return { items: itemsResult.rows, total: countResult.rows[0]?.total ?? 0 };
}

export async function findApprovedPublicProviderByUsername(providerUsername: string) {
  const result = await postgresqlConnectionPool.query({
    text: `select provider_profiles.id, users.username, users.name as "fullName", provider_profiles.professional_title as "professionalTitle",
      provider_profiles.professional_bio as "professionalBio", provider_profiles.years_of_experience as "yearsOfExperience",
      provider_profiles.availability_summary as "availabilitySummary", coalesce(cities.name, provider_profiles.city) as "cityName",
      provider_profiles.is_available_for_new_jobs as "isAvailableForNewJobs", provider_profiles.offers_emergency_service as "offersEmergencyService",
      provider_profiles.maximum_travel_distance_kilometers as "maximumTravelDistanceKilometers",
      (select secure_delivery_url from provider_profile_media_assets
        where provider_profile_id = provider_profiles.id and media_purpose = 'profile_image'
        order by created_at desc limit 1) as "profileImageUrl",
      (select secure_delivery_url from provider_profile_media_assets
        where provider_profile_id = provider_profiles.id and media_purpose = 'work_gallery'
        order by display_order, created_at desc limit 1) as "workImageUrl",
      coalesce((select json_agg(json_build_object('slug', sc.slug, 'displayName', sc.display_name, 'description', sc.description) order by sc.display_order)
        from provider_service_categories pc join service_categories sc on sc.id = pc.category_id where pc.provider_profile_id = provider_profiles.id), '[]') as categories,
      coalesce((select json_agg(json_build_object('id', media.id, 'url', media.secure_delivery_url, 'purpose', media.media_purpose) order by media.display_order, media.created_at)
        from provider_profile_media_assets media where media.provider_profile_id = provider_profiles.id and media.media_purpose in ('profile_image','work_gallery')), '[]') as media,
      coalesce((select json_agg(area_name order by area_name) from provider_service_areas where provider_profile_id = provider_profiles.id), '[]') as "serviceAreas"
      ,coalesce((select json_agg(json_build_object('id', offered.id, 'name', offered.service_name, 'description', offered.service_description, 'startingPriceAmount', offered.starting_price_amount, 'currencyCode', offered.currency_code) order by offered.display_order)
        from provider_offered_services offered where offered.provider_profile_id = provider_profiles.id and offered.is_active = true), '[]') as services
      ,coalesce((select json_agg(language_name order by language_name) from provider_spoken_languages where provider_profile_id = provider_profiles.id), '[]') as languages
      from provider_profiles join "user" users on users.id = provider_profiles.user_id
      left join cities on cities.id = provider_profiles.city_id
      where lower(users.username) = lower($1) and ${publicProviderEligibilitySql} limit 1`,
    values: [providerUsername],
  });
  return result.rows[0] ?? null;
}

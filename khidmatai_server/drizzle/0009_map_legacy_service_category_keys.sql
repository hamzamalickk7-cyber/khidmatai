UPDATE provider_service_categories legacy
SET category_id = catalogue.id, category_key = catalogue.slug
FROM service_categories catalogue
WHERE legacy.category_id IS NULL AND catalogue.slug = CASE lower(legacy.category_key)
  WHEN 'electrical' THEN 'electrical-services'
  WHEN 'plumbing' THEN 'plumbing-services'
  WHEN 'ac-cooling' THEN 'air-conditioning-refrigeration'
  WHEN 'ac & cooling' THEN 'air-conditioning-refrigeration'
  WHEN 'automotive' THEN 'automotive-repair'
  WHEN 'home-cleaning' THEN 'home-cleaning'
  WHEN 'home cleaning' THEN 'home-cleaning'
  WHEN 'painting' THEN 'painting-wall-finishing'
  WHEN 'appliance-repair' THEN 'appliance-repair'
  ELSE replace(lower(legacy.category_key), '_', '-') END;

UPDATE customer_service_preferences legacy
SET category_id = catalogue.id, category_key = catalogue.slug
FROM service_categories catalogue
WHERE legacy.category_id IS NULL AND catalogue.slug = CASE lower(legacy.category_key)
  WHEN 'electrical' THEN 'electrical-services'
  WHEN 'plumbing' THEN 'plumbing-services'
  WHEN 'ac-cooling' THEN 'air-conditioning-refrigeration'
  WHEN 'ac & cooling' THEN 'air-conditioning-refrigeration'
  WHEN 'automotive' THEN 'automotive-repair'
  WHEN 'home cleaning' THEN 'home-cleaning'
  WHEN 'painting' THEN 'painting-wall-finishing'
  WHEN 'appliance repair' THEN 'appliance-repair'
  ELSE replace(lower(legacy.category_key), '_', '-') END;

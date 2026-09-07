UPDATE "user" AS authentication_user
SET image = latest_provider_image.secure_delivery_url,
    "updatedAt" = now()
FROM (
  SELECT DISTINCT ON (owner_user_id) owner_user_id, secure_delivery_url
  FROM provider_profile_media_assets
  WHERE media_purpose = 'profile_image'
  ORDER BY owner_user_id, created_at DESC
) AS latest_provider_image
WHERE authentication_user.id = latest_provider_image.owner_user_id;

UPDATE "user" AS authentication_user
SET image = customer_image.secure_delivery_url,
    "updatedAt" = now()
FROM customer_profile_media_assets AS customer_image
WHERE authentication_user.id = customer_image.owner_user_id;

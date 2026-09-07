import type { Request, Response } from "express";
import { sendSuccessfulApiResponse } from "../../shared/api-response.js";
import { ApplicationError } from "../../shared/application-error.js";
import { findApprovedPublicProviderByUsername, listActiveCities, listActiveCountries, listActiveServiceCategories, listApprovedPublicProviders } from "./marketplace-catalogue-repository.js";
import { publicCityQueryValidationSchema, publicProviderDirectoryQueryValidationSchema, publicProviderUsernamePathValidationSchema } from "./marketplace-catalogue-validation-schemas.js";

export async function listServiceCategoriesController(_request: Request, response: Response) { return sendSuccessfulApiResponse(response, await listActiveServiceCategories()); }
export async function listCountriesController(_request: Request, response: Response) { return sendSuccessfulApiResponse(response, await listActiveCountries()); }
export async function listCitiesController(request: Request, response: Response) {
  const query = publicCityQueryValidationSchema.parse(request.query);
  return sendSuccessfulApiResponse(response, await listActiveCities(query.countryCode, query.search, query.serviceableOnly));
}
export async function listPublicProvidersController(request: Request, response: Response) {
  const query = publicProviderDirectoryQueryValidationSchema.parse(request.query);
  const result = await listApprovedPublicProviders(query);
  return sendSuccessfulApiResponse(response, result.items, 200, { page: query.page, pageSize: query.pageSize, total: result.total, totalPages: Math.ceil(result.total / query.pageSize) });
}
export async function getPublicProviderController(request: Request, response: Response) {
  const { providerUsername } = publicProviderUsernamePathValidationSchema.parse(request.params);
  const provider = await findApprovedPublicProviderByUsername(providerUsername);
  if (!provider) throw new ApplicationError(404, "PUBLIC_PROVIDER_NOT_FOUND", "This provider profile is unavailable.");
  return sendSuccessfulApiResponse(response, provider);
}

import { Router } from "express";
import { createAsyncRequestHandler } from "../../shared/async-request-handler.js";
import { getPublicProviderController, listCitiesController, listCountriesController, listPublicProvidersController, listServiceCategoriesController } from "./marketplace-catalogue-controller.js";

export const marketplaceCatalogueRoutes = Router();
marketplaceCatalogueRoutes.get("/service-categories", createAsyncRequestHandler(listServiceCategoriesController));
marketplaceCatalogueRoutes.get("/countries", createAsyncRequestHandler(listCountriesController));
marketplaceCatalogueRoutes.get("/cities", createAsyncRequestHandler(listCitiesController));
marketplaceCatalogueRoutes.get("/providers", createAsyncRequestHandler(listPublicProvidersController));
marketplaceCatalogueRoutes.get("/providers/:providerUsername", createAsyncRequestHandler(getPublicProviderController));

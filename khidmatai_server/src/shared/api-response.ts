import type { Response } from "express";

export interface PaginationResponseMeta { page: number; pageSize: number; total: number; totalPages: number; }

export function sendSuccessfulApiResponse<ResponseData>(response: Response, responseData: ResponseData, httpStatusCode = 200, meta?: PaginationResponseMeta) {
  return response.status(httpStatusCode).json({ success: true, data: responseData, ...(meta ? { meta } : {}) });
}

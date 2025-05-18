import { ApiResponse } from '../types/api';

export function successResponse<T>(statusCode: number, message: string, data: T): ApiResponse<T> {
  return { statusCode, message, data };
}

export function errorResponse(statusCode: number, message: string): ApiResponse<null> {
  return { statusCode, message, data: null };
}

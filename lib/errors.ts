/**
 * 自訂錯誤類別
 * 遵循 EAKAP 錯誤處理規範
 */

/**
 * 基礎應用程式錯誤
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * 驗證錯誤（400）
 * 用於輸入驗證失敗
 */
export class ValidationError extends Error {
  statusCode: number = 400;

  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * 身份驗證錯誤（401）
 * 用於未登入或 Token 過期
 */
export class AuthenticationError extends Error {
  statusCode: number = 401;

  constructor(message: string = '您的登入已過期，請重新登入') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * 授權錯誤（403）
 * 用於權限不足
 */
export class AuthorizationError extends Error {
  statusCode: number = 403;

  constructor(message: string = '您沒有權限執行此操作') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * 資源不存在錯誤（404）
 */
export class NotFoundError extends Error {
  statusCode: number = 404;

  constructor(message: string = '資源不存在') {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * API 回應格式
 */
export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * 將錯誤轉換為 API 錯誤回應
 */
export function toApiErrorResponse(error: unknown): ApiErrorResponse {
  if (error instanceof ValidationError) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.details,
      },
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      success: false,
      error: {
        code: 'AUTH_EXPIRED',
        message: error.message,
      },
    };
  }

  if (error instanceof AuthorizationError) {
    return {
      success: false,
      error: {
        code: 'PERMISSION_DENIED',
        message: error.message,
      },
    };
  }

  if (error instanceof NotFoundError) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: error.message,
      },
    };
  }

  // 未知錯誤
  return {
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : '發生未預期的錯誤，我們已收到通知',
      details: error,
    },
  };
}

/**
 * 將錯誤轉換為 NextResponse API 回應
 * 便於在 API Route 中使用
 */
export function toApiResponse(error: unknown) {
  const { NextResponse } = require('next/server');

  if (error instanceof ValidationError) {
    return NextResponse.json(toApiErrorResponse(error), { status: 400 });
  }

  if (error instanceof AuthenticationError) {
    return NextResponse.json(toApiErrorResponse(error), { status: 401 });
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json(toApiErrorResponse(error), { status: 403 });
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json(toApiErrorResponse(error), { status: 404 });
  }

  // 未知錯誤
  console.error('未處理的錯誤:', error);
  return NextResponse.json(toApiErrorResponse(error), { status: 500 });
}


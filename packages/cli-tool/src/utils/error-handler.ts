// packages/ignix-mcp-server/src/utils/error-handler.ts
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
}

export function createErrorResponse(error: unknown, classification: string, action: string) {
  const message = getErrorMessage(error);
  return {
    isError: true,
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: false,
            error: message,
            classification,
            action,
          },
          null,
          2
        ),
      },
    ],
  };
}

export function createSuccessResponse(data: unknown) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            success: true,
            ...(typeof data === 'object' ? data : { data }),
          },
          null,
          2
        ),
      },
    ],
  };
}

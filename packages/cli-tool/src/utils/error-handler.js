// packages/ignix-mcp-server/src/utils/error-handler.ts
function getErrorMessage(error) {
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
export function createErrorResponse(error, classification, action) {
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
export function createSuccessResponse(data) {
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
//# sourceMappingURL=error-handler.js.map

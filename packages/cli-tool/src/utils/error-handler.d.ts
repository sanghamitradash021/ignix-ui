export declare function getErrorMessage(error: unknown): string;
export declare function createErrorResponse(
  error: unknown,
  classification: string,
  action: string
): {
  isError: boolean;
  content: {
    type: string;
    text: string;
  }[];
};
export declare function createSuccessResponse(
  data: unknown
): {
  content: {
    type: string;
    text: string;
  }[];
};
//# sourceMappingURL=error-handler.d.ts.map

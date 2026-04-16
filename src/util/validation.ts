export function errorResponse(errors: any[]) {
  return {
    success: false,
    errors
  };
}

export function successResponse(message: string) {
  return {
    success: true,
    message
  };
}

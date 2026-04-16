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


//Validation Checkers
export function validateRequired(obj: any, fields: string[]) {
    const missing: string[] = [];

    for (const field of fields) {
        if (
        obj[field] === undefined ||
        obj[field] === null ||
        obj[field] === ""
        ) {
        missing.push(field);
        }
    }

    if (missing.length === 0) return null;

    return {
        type: "missing required fields",
        fields: missing
    };
}

export function validatePositiveNumber(field: string, value: any) {
    if (typeof value === "number" && value > 0) return null;

    return {
        type: "Invalid Value",
        fields: [
        {
            field,
            value: String(value),
            reason: "must be Integer greater than 0"
        }
        ]
    };
}

//Helper functions
export function collectErrors(...validators: (any | null)[]) {
    return validators.filter((v) => v !== null);
}
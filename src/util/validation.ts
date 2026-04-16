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

export function validateStringArray(field: string, value: any) {
    if (!Array.isArray(value)) {
        return {
        type: "Invalid Value",
        fields: [
            {
            field,
            value: JSON.stringify(value),
            reason: "must be an array"
            }
        ]
        };
    }

    if (!value.every((v) => typeof v === "string")) {
        return {
        type: "Invalid Value",
        fields: [
            {
            field,
            value: JSON.stringify(value),
            reason: "all items must be strings"
            }
        ]
        };
    }

    return null;
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

export function validateEffectsArray(value: any) {
    if (!Array.isArray(value)) {
        return {
        type: "Invalid Value",
        fields: [
            {
            field: "effects",
            value: JSON.stringify(value),
            reason: "must be an array"
            }
        ]
        };
    }

    for (const effect of value) {
        if (typeof effect.text !== "string") {
        return {
            type: "Invalid Value",
            fields: [
            {
                field: "effects.text",
                value: JSON.stringify(effect.text),
                reason: "must be a string"
            }
            ]
        };
        }

        if (!Array.isArray(effect.trigger)) {
        return {
            type: "Invalid Value",
            fields: [
            {
                field: "effects.trigger",
                value: JSON.stringify(effect.trigger),
                reason: "must be an array of strings"
            }
            ]
        };
        }
    }
  return null;
}


//Helper functions
export function collectErrors(...validators: (any | null)[]) {
    return validators.filter((v) => v !== null);
}

export function applyStringUpdate(
    field: string, 
    value: any, 
    options: {
        sqlField: string;
        parent?: string;
        updates: string[];
        params: any[];
        updatedFields: string[];
    }
) {
    if(value===undefined) return;

    options.updates.push(`${options.sqlField} = ?`);
    options.params.push(value);

    const fullField = options.parent ? `${options.parent}.${field}` : field;

    options.updatedFields.push(fullField);
}

export function applyNumberUpdate(
    field: string,
    value: any,
    options: {
        sqlField: string;
        parent?: string;
        updates: string[];
        params: any[];
        updatedFields: string[];
        errors: any[];
    }
) {
    if (value === undefined) return;

    const validation = validatePositiveNumber(field, value);
    if (validation) options.errors.push(validation);

    options.updates.push(`${options.sqlField} = ?`);
    options.params.push(value);

    const fullField = options.parent ? `${options.parent}.${field}`: field;

    options.updatedFields.push(fullField);
}

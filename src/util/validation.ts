export function errorResponse(errors: any[]) {
  return {
		errors,
		success: false,
  };
}

export function successResponse(message: string) {
	return {
		message,
		success: true,
	};
}


//Validation Checkers


/**
 * Checks if all required fields are present in an object.
 * If any field is missing, an error object is returned with a type of "missing required fields" and a list of missing fields.
 * If all fields are present, null is returned.
 *
 * @param obj The object to check.
 * @param fields The list of required fields.
 * @returns An error object if any required field is missing, or null if all fields are present.
 */
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

/**
 * Validate that the given value is an array of strings.
 * @param {string} field The name of the field being validated.
 * @param {any} value The value being validated.
 * @returns {null|{type: string, fields: any[]}} null if the value is valid, or an object describing the validation error.
 */
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



export function validateNumber(
	field: string,
	value: any,
	opts?: { min?: number; max?: number },
) {
	if (typeof value !== "number" || isNaN(value)) {
		return {
			type: "Invalid Value",
			fields: [
				{
					field,
					value: JSON.stringify(value),
					reason: "must be a number",
				},
			],
		};
	}

	if (opts?.min !== undefined && value < opts.min) {
		return {
			type: "Invalid Value",
			fields: [{ field, value, reason: `must be >= ${opts.min}` }],
		};
	}

	if (opts?.max !== undefined && value > opts.max) {
		return {
			type: "Invalid Value",
			fields: [{ field, value, reason: `must be <= ${opts.max}` }],
		};
	}

	return null;
}


/**
 * Validates that the given value is a string.
 * @param {string} field The name of the field being validated.
 * @param {any} value The value being validated.
 * @returns {null|{type: string, fields: any[]}} null if the value is valid, or an object describing the validation error.
 */
export function validateString(field: string, value: any) {
    if (typeof value !== "string") {
        return {
        type: "Invalid Value",
        fields: [
            {
            field,
            value: JSON.stringify(value),
            reason: "must be a string"
            }
        ]
        };
    }
    return null;
}


/**
 * Validates that the given value is an array of objects with the following structure:
 * {
 *   text: string,
 *   trigger: string[]
 * }
 * @param {any} value The value being validated.
 * @returns {null|{type: string, fields: any[]}} null if the value is valid, or an object describing the validation error.
 */
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


/**
 * Collects all validation errors from the given validators and groups them by type.
 * Each error type is an object with a "type" property and a "fields" property, which is an array of objects with a "field" property, a "value" property, and a "reason" property.
 * @param {...validators} Any number of validators, which can be null or an object describing a validation error.
 * @returns An array of objects, each representing a group of validation errors of the same type.
 */
export function collectErrors(...validators: (any | null)[]) {
	const filtered = validators.filter((v) => v !== null);
	const grouped: Record<string, any> = {};

	for (const error of filtered) {
		if (!grouped[error.type]) {
			grouped[error.type] = { type: error.type, fields: [] };
		}

		// Merge fields (array or single object)
		if (Array.isArray(error.fields)) {
			grouped[error.type].fields.push(...error.fields);
		} else {
			grouped[error.type].fields.push(error.fields);
		}
	}

	return Object.values(grouped);
}


/**
 * Updates a string field in the database with the given value.
 * If the value is undefined, does nothing.
 * @param {string} field The name of the field to update.
 * @param {any} value The value to update the field with.
 * @param {object} options An object with the following properties:
 * @param {string} options.sqlField The name of the SQL field to update.
 * @param {string} [options.parent] The parent field to update, if applicable.
 * @param {string[]} [options.updates] An array to append the update SQL to.
 * @param {any[]} [options.params] An array to append the parameter value to.
 * @param {string[]} [options.updatedFields] An array to append the updated field name to.
 */
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

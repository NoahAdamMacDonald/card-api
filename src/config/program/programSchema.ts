import {
	validateString,
	validateNumber,
	validateStringArray,
	validateArrayOfObjects,
} from "../../util/validation";

export const programSchema = {
	name: (v: any) => validateString("name", v),
	image: (v: any) => validateString("image", v),
	playCost: (v: any) => validateNumber("playCost", v, { min: 0 }),
	color: (v: any) => validateString("color", v),
	bitEffect: (v: any) => validateString("bitEffect", v),

	effects: (v: any) =>
		validateArrayOfObjects("effects", v, {
			text: (t) => validateString("text", t),
			trigger: (t) => validateStringArray("trigger", t),
			available: (t) =>
				t === undefined ? null : validateString("available", t),
		}),

	traits: (v: any) => validateStringArray("traits", v),
	keywords: (v: any) => validateStringArray("keywords", v),
};

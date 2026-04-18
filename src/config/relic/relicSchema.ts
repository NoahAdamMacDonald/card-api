import {
	validateString,
	validateNumber,
	validateStringArray,
	validateArrayOfObjects,
} from "../../util/validation";

export const relicSchema = {
	name: (v: any) => validateString("name", v),
	image: (v: any) => (v ? validateString("image", v) : null),
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

	keywords: (v: any) => validateStringArray("keywords", v),
};

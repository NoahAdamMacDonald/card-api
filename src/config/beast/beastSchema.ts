import {
	validateString,
	validateNumber,
	validateStringArray,
	validateArrayOfObjects,
	validateNullableObjectShape,
} from "../../util/validation";

export const beastSchema = {
	name: (v: any) => validateString("name", v),
	image: (v: any) => (v ? validateString("image", v) : null),
	playCost: (v: any) => validateNumber("playCost", v, { min: 0 }),
	level: (v: any) => validateNumber("level", v, { min: 0 }),
	bts: (v: any) => validateNumber("bts", v, { min: 0 }),
	evoCost: (v: any) => validateNumber("evoCost", v, { min: 0 }),
	evoColor: (v: any) => validateString("evoColor", v),

	traits: (v: any) => validateStringArray("traits", v),
	keywords: (v: any) => validateStringArray("keywords", v),
	restrictions: (v: any) => validateStringArray("restrictions", v),

	effects: (v: any) =>
		validateArrayOfObjects("effects", v, {
			text: (t) => validateString("text", t),
			trigger: (t) => validateStringArray("trigger", t),
		}),

	soulEffects: (v: any) =>
		validateArrayOfObjects("soulEffects", v, {
			trigger: (t) => validateString("trigger", t),
			available: (t) => validateString("available", t),
			text: (t) => validateString("text", t),
		}),

	special: (v: any) =>
		validateNullableObjectShape("special", v, {
			name: (t: any) => validateString("name", t),
			text: (t: any) => validateString("text", t),
		}),
};

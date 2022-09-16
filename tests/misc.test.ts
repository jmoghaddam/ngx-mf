import "@angular/compiler";

import { FormBuilder, FormGroup } from "@angular/forms";
import { FormModel, InferModeFromModel, InferModeNonNullable, InferModeNullable, InferModeOptional, InferModeRequired } from "../src";

describe('Misc tests', () => {
    it('undefined nullable optional field should be nonnullalbe', () => {
        interface Model {
            a?: number | null | undefined
        }

        const fb = new FormBuilder();

        type Form = FormModel<Model, null, InferModeFromModel & InferModeNonNullable>;

        const form: Form = fb.group<Form['controls']>({
            a: fb.control(42, { nonNullable: true })
        })

        expect(form.value.a).toBe(42);
        expect(form.controls.a?.value).toBe(42);
    })

    it('nested undefined nullable optional fields should be nonnullable', () => {
        interface Model {
            a?: {
                b?: number | null;
            } | null;
        }

        const fb = new FormBuilder();

        type Form = FormModel<Model, { a: 'group' }, InferModeFromModel & InferModeNonNullable>;
        type NestedForm = NonNullable<NonNullable<Form['controls']['a']>['controls']>;

        const form: Form = fb.group<Form['controls']>({
            a: fb.group<NestedForm>({
                b: fb.control(42, { nonNullable: true })
            })
        })

        expect(form.value.a?.b).toBe(42);
        expect(form.controls.a?.controls.b?.value).toBe(42);
    })

    it('Date inside FormControl', () => {
        interface Model {
            a: Date;
        }

        const fb = new FormBuilder();

        type Form = FormModel<Model, null, InferModeFromModel & InferModeNonNullable>

        const form: Form = fb.group<Form['controls']>({
            a: fb.control(new Date('2022-07-08T06:46:28.452Z'), { nonNullable: true })
        })

        expect(form.value.a?.toISOString()).toBe(new Date('2022-07-08T06:46:28.452Z').toISOString());
        expect(form.controls.a.value.toISOString()).toBe(new Date('2022-07-08T06:46:28.452Z').toISOString());
    })

    it('FormModel after Omit', () => {
        interface Model {
            a: number;
            b: number;
        }

        const fb = new FormBuilder();

        type Form = FormModel<Omit<Model, 'a'>, null, InferModeFromModel & InferModeNullable>;

        const form: Form = fb.group<Form['controls']>({
            b: fb.control(42)
        })

        expect(form.value.b).toBe(42);
        expect(form.controls.b.value).toBe(42);
    })

    it('nonNullable FormControl', () => {
        interface Model {
            a: number | null;
        }

        const fb = new FormBuilder();

        type Form = FormModel<Model, null, InferModeFromModel & InferModeNonNullable>

        const form: Form = fb.group<Form['controls']>({
            a: fb.control(42, { nonNullable: true })
        })

        expect(form.value.a).toBe(42);
        expect(form.controls.a.value).toBe(42);
    })

    it('bubbling', () => {
        interface Model {
            a: {
                b: {
                    c: number;
                }
            },
            d?: {
                e?: {
                    f?: number
                }
            }
        }

        const fb = new FormBuilder();

        type Form = FormModel<Model, { a: { b: 'group' }, d: { e: 'group' } }, InferModeNullable & InferModeRequired>;

        const form: Form = fb.group<Form['controls']>({
            a: fb.group<Form['controls']['a']['controls']>({
                b: fb.group<Form['controls']['a']['controls']['b']['controls']>({
                    c: fb.control(42)
                })
            }),
            d: fb.group<Form['controls']['d']['controls']>({
                e: fb.group<Form['controls']['d']['controls']['e']['controls']>({
                    f: fb.control(42)
                })
            })
        })

        expect(form.value.a?.b?.c).toBe(42);
        expect(form.value.d?.e?.f).toBe(42);
    })

    it('additional field', () => {
        interface Model {
            a: number;
        } 

        const fb = new FormBuilder();

        type Form = FormModel<Model & { b: string }, null, InferModeNullable & InferModeRequired>;

        const form: Form = fb.group<Form['controls']>({
            a: fb.control(42),
            b: fb.control('test'),
        })

        expect(form.value.a).toBe(42);
        expect(form.value.b).toBe('test');

        expect(form.controls.a.value).toBe(42);
        expect(form.controls.b.value).toBe('test');
    })

    it('get conntrols inside optional fields', () => {
        interface Model {
            a: {
                b: number
            }
        }

        const fb = new FormBuilder();

        type Form = FormModel<Model, { a: 'group' }, InferModeNullable & InferModeOptional>

        const form: Form = fb.group<Form['controls']>({
            a: fb.group<NonNullable<Form['controls']['a']>['controls']>({
                b: fb.control(42)
            })
        })

        expect(form.value.a?.b).toBe(42);
        expect(form.controls.a?.controls.b?.value).toBe(42);
    })

    it('corrupting objects', () => {
        interface Model {
            a: {
                b: {
                    c: number
                }
            }
        }

        const fb = new FormBuilder();

        type Form = FormModel<Model, 'group', InferModeNullable & InferModeOptional>

        const form: Form = fb.group<Form['controls']>({
            a: fb.control({
                b: {
                    c: 42
                }
            })
        })

        expect(form.value.a?.b).toStrictEqual({ c: 42 });
        expect(form.controls.a?.value?.b).toStrictEqual({ c: 42 });
    })

    it('Two interfaces one in another', () => {
        interface Model2 {
            a?: number;
            b?: number;
        }

        interface Model {
            a?: {
                b?: Model2
            }
        }

        const fb = new FormBuilder();

        type Form = FormModel<Model, { a: { b: 'control' } }>;

        const form: Form = fb.group<Form['controls']>({
            a: fb.group<Form['controls']['a']['controls']>({
                b: fb.control(null)
            })
        })

        expect(form.value.a?.b).toBeNull();
        expect(form.controls.a.controls.b.value).toBeNull();
    })
})

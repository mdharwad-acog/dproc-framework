
import { z } from 'zod';

// This is a simplified reconstructor. A real-world scenario would need a more robust solution.
export function reconstructZodSchema(schemaDefinition: any): z.ZodObject<any> {
    const shape: { [key: string]: z.ZodType<any, any> } = {};

    for (const key in schemaDefinition) {
        const field = schemaDefinition[key];
        let zodField: z.ZodType<any, any>;

        switch (field.type) {
            case 'string':
                zodField = z.string();
                if (field.url) zodField = (zodField as z.ZodString).url();
                break;
            case 'number':
                zodField = z.number();
                break;
            case 'boolean':
                zodField = z.boolean();
                break;
            case 'enum':
                zodField = z.enum(field.values);
                break;
            default:
                throw new Error(`Unsupported zod type: ${field.type}`);
        }
        
        if (field.description) {
            zodField = zodField.describe(field.description);
        }
        if (field.defaultValue) {
            zodField = zodField.default(field.defaultValue);
        }

        shape[key] = zodField;
    }

    return z.object(shape);
}

// We need a way to get the serializable definition from the original schema
export function getZodSchemaDefinition(schema: z.ZodObject<any>): any {
    const definition: { [key: string]: any } = {};
    const shape = schema.shape;

    for (const key in shape) {
        const field = shape[key];
        const def = field._def;
        const item: any = {};

        if (def.typeName === 'ZodString') {
            item.type = 'string';
            if (def.checks.some((c: any) => c.kind === 'url')) {
                item.url = true;
            }
        } else if (def.typeName === 'ZodNumber') {
            item.type = 'number';
        } else if (def.typeName === 'ZodBoolean') {
            item.type = 'boolean';
        } else if (def.typeName === 'ZodEnum') {
            item.type = 'enum';
            item.values = def.values;
        } else {
            // Not a simple type, might need more complex handling
        }

        if (def.description) {
            item.description = def.description;
        }
        if (def.defaultValue) {
            // Default value is a function, so we execute it
            item.defaultValue = def.defaultValue();
        }
        definition[key] = item;
    }

    return definition;
}

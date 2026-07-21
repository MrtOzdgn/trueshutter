import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const cameras = defineCollection({
  loader: file('src/data/cameras.json'),
  schema: z.object({
    id: z.string(),
    make: z.enum(['Nikon', 'Canon', 'Sony', 'Fujifilm']),
    model: z.string(),
    format: z.enum(['NEF', 'CR3', 'ARW', 'RAF', 'CR2']),
    status: z.enum(['confirmed', 'expected', 'unsupported']),
    mechanism: z.string(),
    ratedShutterLife: z.number().nullable(),
    notes: z.string().nullable(),
  }),
});

export const collections = { cameras };

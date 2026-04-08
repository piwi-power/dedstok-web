import { defineField, defineType } from 'sanity'

export const sneakerWallItemSchema = defineType({
  name: 'sneakerWallItem',
  title: 'Sneaker Wall Item',
  type: 'document',
  description: 'Curated grails shown on the sneaker wall in the 3D store. Editorial only — nothing for sale.',
  fields: [
    defineField({
      name: 'name',
      title: 'Sneaker Name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'string',
      options: {
        list: ['Nike', 'Jordan', 'Adidas', 'New Balance', 'Supreme', 'Other'],
        layout: 'dropdown',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'year',
      title: 'Release Year',
      type: 'number',
      validation: (r) => r.required().min(1980).max(2099),
    }),
    defineField({
      name: 'description',
      title: 'Story / Cultural Context',
      type: 'text',
      rows: 5,
      description: 'The founder\'s personal take. Why this sneaker matters.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'article',
      title: 'Linked Article (optional)',
      type: 'reference',
      to: [{ type: 'article' }],
      description: 'If there is a full article about this sneaker, link it here.',
    }),
    defineField({
      name: 'display_order',
      title: 'Display Order',
      type: 'number',
      description: 'Controls the order on the sneaker wall. Lower = higher up.',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'brand',
      media: 'image',
    },
  },
})

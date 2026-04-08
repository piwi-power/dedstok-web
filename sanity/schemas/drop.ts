import { defineField, defineType } from 'sanity'

export const dropSchema = defineType({
  name: 'drop',
  title: 'Drop',
  type: 'document',
  fields: [
    defineField({
      name: 'item_name',
      title: 'Item Name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'item_name' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'market_value',
      title: 'Market / StockX Value (USD)',
      type: 'number',
      description: 'The resell or StockX value. Displayed publicly on the site.',
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'entry_price',
      title: 'Entry Price Per Spot (USD)',
      type: 'number',
      description: 'Set weekly. Common values: $1, $10, $25, $50, $100.',
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'total_spots',
      title: 'Total Spots',
      type: 'number',
      description: 'Maximum number of entries for this drop. Max 2 per person.',
      validation: (r) => r.required().min(10),
    }),
    defineField({
      name: 'draw_date',
      title: 'Draw Date',
      type: 'datetime',
      description: 'Saturday at 23:59 local time.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Scheduled', value: 'scheduled' },
          { title: 'Active', value: 'active' },
          { title: 'Closed', value: 'closed' },
          { title: 'Drawn', value: 'drawn' },
        ],
        layout: 'radio',
      },
      initialValue: 'scheduled',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'sourcing_tier',
      title: 'Sourcing Tier (Internal)',
      type: 'string',
      description: 'A = Retail via plug. B = Resell. C = Premium resell. Never shown publicly.',
      options: {
        list: [
          { title: 'A — Retail (best margin)', value: 'A' },
          { title: 'B — Resell (standard)', value: 'B' },
          { title: 'C — Premium resell', value: 'C' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: {
      title: 'item_name',
      subtitle: 'status',
      media: 'images.0',
    },
  },
})

import { createClient } from '@sanity/client'

const token = process.env.SANITY_WRITE_TOKEN
if (!token) {
  console.error('Missing SANITY_WRITE_TOKEN. Run as: SANITY_WRITE_TOKEN=your_token node scripts/create-article.mjs')
  process.exit(1)
}

const client = createClient({
  projectId: '6aatrh9k',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})

const article = {
  _type: 'article',
  title: 'The Rise and Fall of Supreme',
  slug: { _type: 'slug', current: 'the-rise-and-fall-of-supreme' },
  excerpt: 'From a 274-square-foot skate shop on Lafayette Street to a $2.1 billion acquisition — and the slow unraveling that followed.',
  category: 'Streetwear Culture',
  author: 'Ziad El Bitar',
  published_at: new Date().toISOString(),
  body: [
    {
      _type: 'block', _key: 'b1', style: 'normal', markDefs: [],
      children: [{ _type: 'span', _key: 's1', marks: [], text: 'In 1994, James Jebbia opened a small skate shop on Lafayette Street in downtown Manhattan. The layout was deliberate: racks along the walls, an open floor in the center so skaters could actually ride through it. Supreme was not designed to feel like a store. It was designed to feel like a spot.' }]
    },
    {
      _type: 'block', _key: 'b2', style: 'normal', markDefs: [],
      children: [{ _type: 'span', _key: 's2', marks: [], text: 'That instinct — protect the culture, control the access — became the blueprint for everything that followed.' }]
    },
    {
      _type: 'block', _key: 'b3', style: 'h2', markDefs: [],
      children: [{ _type: 'span', _key: 's3', marks: [], text: 'Building the Wall' }]
    },
    {
      _type: 'block', _key: 'b4', style: 'normal', markDefs: [],
      children: [{ _type: 'span', _key: 's4', marks: [], text: "Supreme's early power came from scarcity, but not the manufactured kind. Jebbia was just a guy who understood his community. He made things in small quantities because the demand wasn't there yet, and by the time it was, the habit was already set. Limited drops. No restocks. If you missed it, you missed it." }]
    },
    {
      _type: 'block', _key: 'b5', style: 'normal', markDefs: [],
      children: [{ _type: 'span', _key: 's5', marks: [], text: 'The brand spent fifteen years building credibility the hard way. Collaborations with artists, photographers, and musicians who actually meant something to the culture. Larry Clark. Nan Goldin. Raekwon. These were not marketing moves — they were relationships. The red box logo became shorthand for something real.' }]
    },
    {
      _type: 'block', _key: 'b6', style: 'normal', markDefs: [],
      children: [{ _type: 'span', _key: 's6', marks: [], text: 'By the mid-2000s, Supreme had crossed the Atlantic. The Harajuku kids in Tokyo were lining up before the doors opened. Europe followed. The brand had never run a single advertisement.' }]
    },
    {
      _type: 'block', _key: 'b7', style: 'h2', markDefs: [],
      children: [{ _type: 'span', _key: 's7', marks: [], text: 'The Hypebeast Era' }]
    },
    {
      _type: 'block', _key: 'b8', style: 'normal', markDefs: [],
      children: [{ _type: 'span', _key: 's8', marks: [], text: 'The 2010s changed everything and nothing at the same time. Sneaker culture and streetwear merged into a single economy. StockX launched. Resell became a career. Supreme drops turned into financial events, with bots buying out inventory in seconds and hoodies flipping for five times retail before noon.' }]
    },
    {
      _type: 'block', _key: 'b9', style: 'normal', markDefs: [],
      children: [{ _type: 'span', _key: 's9', marks: [], text: 'On one hand, this was validation. On the other, it was infiltration. The kids in line were no longer skaters. They were investors. The culture that Supreme had spent two decades protecting was now being monetized by people who had never set foot on a board.' }]
    },
    {
      _type: 'block', _key: 'b10', style: 'normal', markDefs: [],
      children: [{ _type: 'span', _key: 's10', marks: [], text: 'Supreme adapted — or appeared to. Drops got more theatrical. The Louis Vuitton collaboration in 2017 was the moment the brand went fully mainstream. It was also, for many, the moment it stopped feeling like Supreme.' }]
    },
    {
      _type: 'block', _key: 'b11', style: 'h2', markDefs: [],
      children: [{ _type: 'span', _key: 's11', marks: [], text: 'The Acquisition' }]
    },
    {
      _type: 'block', _key: 'b12', style: 'normal', markDefs: [],
      children: [{ _type: 'span', _key: 's12', marks: [], text: 'In 2020, VF Corporation — the parent company of Vans, The North Face, and Timberland — acquired Supreme for $2.1 billion. Jebbia stayed on. The press releases were careful. Nothing would change.' }]
    },
    {
      _type: 'block', _key: 'b13', style: 'normal', markDefs: [],
      children: [{ _type: 'span', _key: 's13', marks: [], text: 'Things changed.' }]
    },
    {
      _type: 'block', _key: 'b14', style: 'normal', markDefs: [],
      children: [{ _type: 'span', _key: 's14', marks: [], text: "Not immediately, and not all at once. But the energy shifted. Drop quality became inconsistent. Some collaborations felt forced. The brand that had always said no started saying yes to things that didn't fit. When you're owned by a publicly traded corporation, the quarterly report is always in the room." }]
    },
    {
      _type: 'block', _key: 'b15', style: 'normal', markDefs: [],
      children: [{ _type: 'span', _key: 's15', marks: [], text: 'VF sold Supreme to EssilorLuxottica in 2023 for $1.5 billion — a $600 million loss in three years. The math told a story that no press release could spin.' }]
    },
    {
      _type: 'block', _key: 'b16', style: 'h2', markDefs: [],
      children: [{ _type: 'span', _key: 's16', marks: [], text: 'What It Means' }]
    },
    {
      _type: 'block', _key: 'b17', style: 'normal', markDefs: [],
      children: [{ _type: 'span', _key: 's17', marks: [], text: "Supreme didn't die. It's still there, still dropping, still selling out. But the mystique is gone, and mystique was always the product. You cannot manufacture the feeling that something is real. You either protect it or you don't." }]
    },
    {
      _type: 'block', _key: 'b18', style: 'normal', markDefs: [],
      children: [{ _type: 'span', _key: 's18', marks: [], text: 'The lesson is not that Supreme failed. The lesson is that the most valuable thing a brand can have — genuine cultural credibility — is also the most fragile. It takes decades to build and one wrong decision to start losing.' }]
    },
    {
      _type: 'block', _key: 'b19', style: 'normal', markDefs: [],
      children: [{ _type: 'span', _key: 's19', marks: [], text: 'Every brand in the space is watching. The ones that survive will be the ones that remember why the wall was built in the first place.' }]
    },
  ]
}

const result = await client.create(article)
console.log('Done. Article ID:', result._id)

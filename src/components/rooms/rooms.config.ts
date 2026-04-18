// DEDSTOK Room Navigation Config
//
// Architecture:
//   door → lobby
//   lobby: center = vault | right = study | left = hall
//   vault: display case → /drops | right edge button → gallery | back → lobby
//   gallery: leaderboard hotspot → /leaderboard | left edge button → vault | back → lobby
//   study: articles hotspot → /articles | back → lobby
//   hall: leaderboard hotspot → /leaderboard | back → lobby
//
// Hotspot (x, y) are % of viewport. Adjust after final images are in.
// navButtons appear at the left/right edge of the screen, expand on hover.

export type HotspotAction =
  | { type: 'navigate-room'; target: string }
  | { type: 'navigate-page'; target: string }

export interface Hotspot {
  id: string
  x: number          // % from left
  y: number          // % from top
  label: string
  sublabel?: string
  action: HotspotAction
  requiresAuth?: boolean
  arrowDirection?: 'left' | 'right'   // default right
  variant?: 'circle-nav'              // circle button style (for in-image nav)
}

export interface RoomNavButton {
  id: string
  direction: 'left' | 'right'
  label: string      // shown on hover
  action: HotspotAction
}

export interface Room {
  id: string
  name: string
  image: string
  gradient: string
  hotspots: Hotspot[]
  navButtons?: RoomNavButton[]
  imageNote?: string
}

export const ROOMS: Record<string, Room> = {

  door: {
    id: 'door',
    name: 'The Entrance',
    image: '/rooms/door.png',
    gradient: 'radial-gradient(ellipse at 50% 55%, #2c1f12 0%, #0c0a09 70%)',
    imageNote: 'POV standing outside. Dark arched double door center. Light bleeding through the gap. Walnut paneling.',
    hotspots: [
      {
        id: 'enter',
        x: 50,
        y: 52,
        label: 'Enter',
        sublabel: 'One drop. One winner.',
        action: { type: 'navigate-room', target: 'lobby' },
      },
    ],
  },

  lobby: {
    id: 'lobby',
    name: 'The Lobby',
    image: '/rooms/lobby.png',
    gradient: 'linear-gradient(160deg, #1C1917 0%, #0c0a09 50%, #1C1917 100%)',
    imageNote: 'Three archways. Center door slightly ajar with warm light (= vault). Right arch = study. Left arch = hall. Dark walnut paneling.',
    hotspots: [
      {
        // Center door — lit from behind, the main attraction
        id: 'vault',
        x: 45,
        y: 50,
        label: 'The Vault',
        sublabel: "This week's drop",
        action: { type: 'navigate-room', target: 'vault' },
      },
      {
        // Right archway
        id: 'study',
        x: 78,
        y: 46,
        label: 'The Study',
        sublabel: 'Culture & articles',
        action: { type: 'navigate-room', target: 'study' },
        arrowDirection: 'right',
      },
      {
        // Left archway
        id: 'hall',
        x: 24,
        y: 46,
        label: 'The Hall',
        sublabel: 'Rankings',
        action: { type: 'navigate-room', target: 'hall' },
        arrowDirection: 'left',
      },
    ],
  },

  vault: {
    id: 'vault',
    name: 'The Vault',
    image: '/rooms/vault.png',
    gradient: 'radial-gradient(ellipse at 50% 52%, #3d2b1a 0%, #0c0a09 65%)',
    imageNote: 'Vault door center, IBCA decks left wall, DS monogram floor, gallery door right.',
    hotspots: [
      {
        id: 'drop-case',
        x: 50,
        y: 45,
        label: "This Week's Drop",
        sublabel: 'Enter the draw',
        action: { type: 'navigate-page', target: '/drops' },
      },
      {
        // Circle-nav button ON the right vault door leading to gallery
        id: 'to-gallery',
        x: 77,
        y: 50,
        label: 'The Gallery',
        action: { type: 'navigate-room', target: 'gallery' },
        variant: 'circle-nav',
      },
      {
        id: 'back',
        x: 7,
        y: 90,
        label: 'Lobby',
        action: { type: 'navigate-room', target: 'lobby' },
      },
    ],
  },

  gallery: {
    id: 'gallery',
    name: 'The Gallery',
    image: '/rooms/gallery.png',
    gradient: 'linear-gradient(180deg, #0a0804 0%, #1a1208 50%, #0c0a09 100%)',
    imageNote: 'KAWS figures center, Kate Moss + Mike Tyson posters, DS monogram floor, empty pedestals.',
    hotspots: [
      {
        id: 'archive',
        x: 50,
        y: 72,
        label: 'Past Drops',
        sublabel: 'Every drop. Every winner.',
        action: { type: 'navigate-page', target: '/drops/archive' },
      },
      {
        id: 'back',
        x: 7,
        y: 90,
        label: 'Lobby',
        action: { type: 'navigate-room', target: 'lobby' },
      },
    ],
    navButtons: [
      {
        id: 'to-vault',
        direction: 'left',
        label: 'The Vault',
        action: { type: 'navigate-room', target: 'vault' },
      },
    ],
  },

  study: {
    id: 'study',
    name: 'The Study',
    image: '/rooms/study.png',
    gradient: 'radial-gradient(ellipse at 38% 58%, #2c1f12 0%, #0a0804 70%)',
    imageNote: 'Doorway POV. Dark bookshelves, leather couch, vinyl player, skate decks, collectibles.',
    hotspots: [
      {
        id: 'articles',
        x: 50,
        y: 52,
        label: 'Culture',
        sublabel: 'Articles & editorial',
        action: { type: 'navigate-page', target: '/articles' },
      },
      {
        id: 'back',
        x: 7,
        y: 90,
        label: 'Lobby',
        action: { type: 'navigate-room', target: 'lobby' },
      },
    ],
  },

  hall: {
    id: 'hall',
    name: 'The Hall',
    image: '/rooms/hall.png',
    gradient: 'linear-gradient(180deg, #0a0804 0%, #0c0a09 50%, #0a0804 100%)',
    imageNote: 'Supreme x Everlast boxing ring, director chair center, sneaker boxes, money stacks.',
    hotspots: [
      {
        id: 'leaderboard',
        x: 50,
        y: 44,
        label: 'The Hall of Records',
        sublabel: 'Rankings',
        action: { type: 'navigate-page', target: '/leaderboard' },
      },
      {
        id: 'back',
        x: 7,
        y: 90,
        label: 'Lobby',
        action: { type: 'navigate-room', target: 'lobby' },
      },
    ],
  },

}

export const ROOM_FLOW = ['door', 'lobby', 'vault']

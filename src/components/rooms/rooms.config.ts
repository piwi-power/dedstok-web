// DEDSTOK Room Navigation Config
//
// Architecture:
//   door → lobby
//   lobby ↔ vault ↔ gallery
//   lobby ↔ study
//   lobby ↔ hall
//
// All room-to-room navigation uses circle-nav variant.
// Page navigation (↑ pill) for /drops, /articles, /leaderboard, /drops/archive.
// No back buttons — every room has an explicit circle-nav back to its parent.

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
  variant?: 'circle-nav'              // circle button — room-to-room lateral nav
}

export interface RoomNavButton {
  id: string
  direction: 'left' | 'right'
  label: string
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
        action: { type: 'navigate-room', target: 'lobby' },
        variant: 'circle-nav',
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
        // Center door — lit from behind, main attraction
        id: 'vault',
        x: 45,
        y: 50,
        label: 'The Vault',
        action: { type: 'navigate-room', target: 'vault' },
        variant: 'circle-nav',
      },
      {
        // Right archway
        id: 'study',
        x: 78,
        y: 46,
        label: 'The Study',
        action: { type: 'navigate-room', target: 'study' },
        variant: 'circle-nav',
        arrowDirection: 'right',
      },
      {
        // Left archway
        id: 'hall',
        x: 24,
        y: 46,
        label: 'The Hall',
        action: { type: 'navigate-room', target: 'hall' },
        variant: 'circle-nav',
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
        // x aligned with vault handle shaft (slightly right of dead center)
        id: 'drop-case',
        x: 50,
        y: 58,
        label: "This Week's Drop",
        sublabel: 'Enter the draw',
        action: { type: 'navigate-page', target: '/drops' },
      },
      {
        // Right vault door → gallery
        id: 'to-gallery',
        x: 77,
        y: 50,
        label: 'The Gallery',
        action: { type: 'navigate-room', target: 'gallery' },
        variant: 'circle-nav',
      },
      {
        // Left side → back to lobby
        id: 'to-lobby',
        x: 16,
        y: 50,
        label: 'The Lobby',
        action: { type: 'navigate-room', target: 'lobby' },
        variant: 'circle-nav',
        arrowDirection: 'left',
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
        // Floor center — open floor in front of figures
        id: 'archive',
        x: 50,
        y: 80,
        label: 'Past Drops',
        sublabel: 'Every drop. Every winner.',
        action: { type: 'navigate-page', target: '/drops/archive' },
      },
      {
        // Left gallery doorway → vault
        id: 'to-vault',
        x: 16,
        y: 50,
        label: 'The Vault',
        action: { type: 'navigate-room', target: 'vault' },
        variant: 'circle-nav',
        arrowDirection: 'left',
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
        // Left doorway → back to lobby
        id: 'to-lobby',
        x: 16,
        y: 50,
        label: 'The Lobby',
        action: { type: 'navigate-room', target: 'lobby' },
        variant: 'circle-nav',
        arrowDirection: 'left',
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
        // Lifted so expanded label grazes rope, not below it
        id: 'leaderboard',
        x: 50,
        y: 36,
        label: 'The Hall of Records',
        sublabel: 'Rankings',
        action: { type: 'navigate-page', target: '/leaderboard' },
      },
      {
        // Right side → back to lobby (entered from left, exit to right)
        id: 'to-lobby',
        x: 84,
        y: 50,
        label: 'The Lobby',
        action: { type: 'navigate-room', target: 'lobby' },
        variant: 'circle-nav',
      },
    ],
  },

}

export const ROOM_FLOW = ['door', 'lobby', 'vault']

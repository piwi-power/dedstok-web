// DEDSTOK Room Navigation Config
// Each room is a full-viewport image with hotspot beacons.
// Image files go in /public/rooms/. Drop the generated images there
// and update the `image` field below to match the filename.
//
// Hotspot coordinates (x, y) are percentages of the viewport.
// Adjust after final images are in — these are estimated placeholders
// based on the art direction prompts.
//
// See BRANDING.md Section 9 for full room spec.

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
}

export interface Room {
  id: string
  name: string
  image: string      // path relative to /public
  gradient: string   // placeholder gradient while image loads or is missing
  hotspots: Hotspot[]
  // For designer reference
  imageNote?: string
}

export const ROOMS: Record<string, Room> = {

  door: {
    id: 'door',
    name: 'The Entrance',
    image: '/rooms/door.jpg',
    gradient: 'radial-gradient(ellipse at 62% 55%, #2c1f12 0%, #0c0a09 70%)',
    imageNote: 'Exterior. Dark door right-of-center. Gold nameplate. Lantern top-left.',
    hotspots: [
      {
        // Door is right-of-center in the image. Beacon sits at the door center/handle zone.
        id: 'enter',
        x: 63,
        y: 54,
        label: 'Enter',
        sublabel: 'One drop. One winner.',
        action: { type: 'navigate-room', target: 'lobby' },
      },
    ],
  },

  lobby: {
    id: 'lobby',
    name: 'The Lobby',
    image: '/rooms/lobby.jpg',
    gradient: 'linear-gradient(160deg, #1C1917 0%, #0c0a09 50%, #1C1917 100%)',
    imageNote: 'Three archways center. Candelabras. Dark walnut paneling. Painting right wall.',
    hotspots: [
      {
        // Center archway — deepest, darkest opening. Primary destination.
        id: 'vault',
        x: 50,
        y: 44,
        label: 'The Vault',
        sublabel: 'Current drop',
        action: { type: 'navigate-room', target: 'vault' },
      },
      {
        // Right archway
        id: 'gallery',
        x: 72,
        y: 48,
        label: 'The Gallery',
        sublabel: 'Past drops',
        action: { type: 'navigate-room', target: 'gallery' },
      },
      {
        // Left archway
        id: 'study',
        x: 28,
        y: 48,
        label: 'The Study',
        sublabel: 'Culture & articles',
        action: { type: 'navigate-room', target: 'study' },
      },
      {
        // Painting on right wall — feels like a hidden room marker
        id: 'hall',
        x: 88,
        y: 42,
        label: 'The Hall',
        sublabel: 'Leaderboard',
        action: { type: 'navigate-room', target: 'hall' },
      },
    ],
  },

  vault: {
    id: 'vault',
    name: 'The Vault',
    image: '/rooms/vault.jpg',
    gradient: 'radial-gradient(ellipse at 50% 52%, #3d2b1a 0%, #0c0a09 65%)',
    imageNote: 'Dead-center gold display case on marble plinth. Dark walnut walls. Spotlight from above.',
    hotspots: [
      {
        // Case is perfectly centered in the image. Beacon sits just above the case midpoint.
        id: 'drop-case',
        x: 50,
        y: 44,
        label: "This Week's Drop",
        sublabel: 'Enter the draw',
        action: { type: 'navigate-page', target: '/drops' },
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
    image: '/rooms/gallery.jpg',
    gradient: 'linear-gradient(180deg, #0a0804 0%, #1C1917 50%, #0c0a09 100%)',
    imageNote: 'Dark gallery. Four gold-framed canvases with gold plaques. Track lighting. Center perspective.',
    hotspots: [
      {
        // Center of the gallery — between the two center frames on the back wall
        id: 'archive',
        x: 50,
        y: 42,
        label: 'The Archive',
        sublabel: 'Every drop. Every winner.',
        action: { type: 'navigate-page', target: '/drops' },
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

  study: {
    id: 'study',
    name: 'The Study',
    image: '/rooms/study.jpg',
    gradient: 'radial-gradient(ellipse at 38% 58%, #2c1f12 0%, #0a0804 70%)',
    imageNote: 'Doorway POV. Dark bookshelves floor-to-ceiling. Leather armchair center-left. Warm lamp. Magazines on table right.',
    hotspots: [
      {
        // Armchair is at roughly 38% left, 62% top — beacon sits above it near the lamp glow
        id: 'articles',
        x: 40,
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
    image: '/rooms/hall.jpg',
    gradient: 'linear-gradient(180deg, #0a0804 0%, #1C1917 40%, #0a0804 100%)',
    imageNote: 'Monumental corridor. Inscribed stone wall centered. Skylights above. Wooden doors flanking entrance.',
    hotspots: [
      {
        // Inscribed wall is perfectly centered. Beacon at the top of the inscription block.
        id: 'leaderboard',
        x: 50,
        y: 38,
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

// Room order for breadcrumb / history tracking
export const ROOM_FLOW = ['door', 'lobby', 'vault']

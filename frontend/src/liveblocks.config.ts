// frontend/src/liveblocks.config.ts
import { createClient } from "@liveblocks/client";

// Create the Liveblocks client using the environment variable
const client = createClient({
  publicApiKey: import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY,
});

export { RoomProvider, useRoom } from "@liveblocks/react/suspense";
export { client };
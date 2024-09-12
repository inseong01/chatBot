import { supabase } from "./supabaseClient";

// join a room
const channelB = supabase.channel('room-1');

channelB.subscribe((status) => {
  if (status !== 'SUBSCRIBED') return null

  // send a message once the client is subscribled
  channelB.send({
    type: 'broadcast',
    event: 'test',
    payload: { message: 'Hello world' }
  })
})

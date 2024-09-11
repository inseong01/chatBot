import { supabase } from "./supabaseClient";

// join a room
const channelA = supabase.channel('room-1');

// function to log any messages we receive
function messageReceived(payload) {
  console.log(payload);
}

// subscribe to the room
channelA
  .on(
    'broadcast',
    { event: 'test' },
    (payload) => messageReceived(payload)
  )
  .subscribe()
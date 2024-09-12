import supabase from "./supabase/supabaseClient.js";

// join a room
const channelA = supabase.channel('room-one', {
  config: {
    broadcast: { self: true }
  }
});
const channelB = supabase.channel('room-one', {
  config: {
    broadcast: { self: true }
  }
});

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
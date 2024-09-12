import supabase from "./supabase/supabaseClient.js";

// join a room
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

channelB.subscribe((status) => {
  // Wait for successful connection
  if (status !== 'SUBSCRIBED') {
    return null
  }
  channelB.send({
    type: 'broadcast',
    event: 'test',
    payload: { message: 'hello, world. this is B' },
  })
})
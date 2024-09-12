import supabase from "./supabaseClient.js";

// join a room
const channelA = supabase.channel('room-one');

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

setInterval(() => {

  channelA.send({
    type: 'broadcast',
    event: 'test',
    payload: { message: 'hello, world' },
  })
}, 1000)
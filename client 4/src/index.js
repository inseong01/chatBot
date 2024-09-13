import supabase from "./supabase/supabaseClient.js";

// join a room
const roomFour = supabase.channel('room-one', {
  config: {
    broadcast: { self: true }
  }
});

// subscribe to the room
// roomFour
//   .on(
//     'presence',
//     { event: 'sync' },
//     () => {
//       const newState = roomFour.presenceState()
//       console.log('sync', newState)
//     }
//   )
//   .on('presence', { event: 'join' }, ({ key, newPresences }) => {
//     console.log('join', key, newPresences)
//   })
//   .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
//     console.log('leave', key, leftPresences)
//   })
//   .subscribe()

const userStatus = {
  user: 'user-4',
  online_at: new Date().toISOString(),
  user_type: 'client'
}

roomFour.subscribe(async (status) => {
  if (status !== 'SUBSCRIBED') return;

  const presenceTrackStatus = await roomFour.track(userStatus)
  console.log(presenceTrackStatus);
})
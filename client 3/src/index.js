import supabase from "./supabase/supabaseClient.js";

// join a room
const roomThree = supabase.channel('room-one', {
  config: {
    broadcast: { self: true }
  }
});

// subscribe to the room
// roomThree
//   .on(
//     'presence',
//     { event: 'sync' },
//     () => {
//       const newState = roomThree.presenceState()
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
  user: 'user-3',
  online_at: new Date().toISOString(),
  user_type: 'client',
}

roomThree.subscribe(async (status) => {
  if (status !== 'SUBSCRIBED') return;

  const presenceTrackStatus = await roomThree.track(userStatus)
  console.log(presenceTrackStatus);
})
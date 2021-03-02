const socketio = require('socket.io')
const {addUserToRoom,getUsersInRoom} = require("./utils/users")
const createSocketServer = server => {// create to server
    const io = socketio(server)
    io.on("connection", socket =>{ // connect to server
        console.log(`New socket connection --> ${socket.id}`)
        socket.on("joinRoom", async data => {
            try {
              // add user to specified room (in mongo)
              console.log({...data})
              const { username, room } = await addUserToRoom({
                socketId: socket.id,
                ...data,
                
              })
      
              socket.join(room)
      
              const messageToRoomMembers = {
                sender: "Admin",
                text: `${username} has joined the room!`,
                createdAt: new Date(),
              }
      
              socket.broadcast.to(room).emit("message", messageToRoomMembers) // sending the message to all the users connected in the room
      
              // send rooms info (users list) to all users (example: when someone joins/leaves room)
              const roomMembers = await getUsersInRoom(room)
      
              io.to(room).emit("roomData", { room, users: roomMembers }) // server sending server message to all members
            } catch (error) {
              console.log(error)
            }
          }) // joining chat room// client join the room
        socket.on("sendmessage",({room,message})=>{}) // client send a message.
        socket.on("leaveRoom",()=>{}) // client leaves the room

    }) 

}

    module.exports =createSocketServer
const socketio = require('socket.io')
const {addUserToRoom,getUsersInRoom,removeUserFromRoom,getUserBySocket} = require("./utils/users")
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
          socket.on("sendMessage", async ({ room, message }) => {
            // when a client sends a message
      
            // search in the room for that user (search by socket.id)
            const user = await getUserBySocket(room, socket.id)
      
            const messageContent = {
              text: message,
              sender: user.username,
              room,
            }
            // save message in db
            await addMessage(messageContent.sender, room, messageContent.text)
      
            // send the message to all the people in that room
            io.to(room).emit("message", messageContent)
          })
      
          socket.on("leaveRoom", async ({ room }) => {
            // when a client leaves chat room
      
            try {
              // Remove socketid from room in db
      
              const username = await removeUserFromRoom(socket.id, room)
      
              const messageToRoomMembers = {
                sender: "Admin",
                text: `${username} has left`,
                createdAt: new Date(),
              }
              io.to(room).emit("message", messageToRoomMembers)
      
              // send rooms info (users list) to all users
              const roomMembers = await getUsersInRoom(room)
              io.to(room).emit("roomData", { room, users: roomMembers })
            } catch (error) {
              console.log(error)
            }
          }) // client send a message.
        socket.on("leaveRoom",()=>{}) // client leaves the room

    }) 

}

    module.exports =createSocketServer
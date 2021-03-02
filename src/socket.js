const socketio = require('socket.io')
const createSocketServer = server => {// create to server
    const io = socketio(server)
    io.on("connection",socket =>{ // connect to server
        console.log(`New socket connection --> ${socket.id}`)
        socket.on("message",()=>{}) // listen to messages to handle them.
        

    }) 

}

    module.exports =createSocketServer
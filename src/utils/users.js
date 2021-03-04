const RoomModel = require("../services/rooms/schema");
const addUserToRoom = async ({ username, socketId, room }) => {
  try {
   
    const roomName =await createRoom(room);
    const user = await RoomModel.findOne({
      name: roomName,
      "members.username": username,
    });
   
    if (user) {
      // if user is in room update socketId
      await RoomModel.findOneAndUpdate(
        { name: roomName, "members.username": username },
        { "members.$.socketId": socketId } // replace prev Id with the new socketId
      );
    } else {
      // if doesn't exist add it to members
      await RoomModel.findOneAndUpdate(
        { name: roomName },
        { $addToSet: { members: { username, socketId } } }
      );
    }
    
    return { username, room:roomName };
  } catch (error) {
    console.log(error);
  }
};

// on join if room exist ? joın : create
const createRoom = async (roomName) => {
  try {
    const room = await RoomModel.findOne({name:roomName})
    if (!room){
      const newRoom = await new RoomModel({ name: roomName });

    const savedRoom = await newRoom.save();
    if (savedRoom._id) return savedRoom.name;
    }else{
      return room.name;
    }
    
  } catch (error) {
    console.log(error);
  }
};
const getUsersInRoom = async (roomName) => {
  try {
    console.log({roomName})
    const room = await RoomModel.findOne({ name: roomName });

    return room.members;
  } catch (error) {
    console.log(error);
  }
};
const getUserBySocket = async (roomName, socketId) => {
  try {
    const room = await RoomModel.findOne({ name: roomName })
  
    const user = room.members.find(user => user.socketId === socketId)
    return user
  } catch (error) {
    console.log(error)
  }
}
const removeUserFromRoom = async (socketId, roomName) => {
  try {
    const room = await RoomModel.findOne({ name: roomName })

    const username = room.members.find(member => member.socketId === socketId)

    await RoomModel.findOneAndUpdate(
      { name: roomName },
      { $pull: { members: { socketId } } }
    )

    return username
  } catch (error) {}
}
module.exports = {
  addUserToRoom,
  getUsersInRoom,
  getUserBySocket,
  removeUserFromRoom
};

const RoomModel = require("../services/rooms/schema");
const addUserToRoom = async ({ sender, receiver, socketId, room }) => {
  try {
    const roomName = room ? room : await createRoom(sender, receiver);
    const user = await RoomModel.findOne({
      name: roomName,
      "members.username": sender,
    });
    const user1 = await RoomModel.findOne({
      name: roomName,
      "members.username": receiver,
    });
    if (user) {
      // if user is in room update socketId
      await RoomModel.findOneAndUpdate(
        { name: roomName, "members.username": sender },
        { "members.$.socketId": socketId } // replace prev Id with the new socketId
      );
    } else {
      // if doesn't exist add it to members
      await RoomModel.findOneAndUpdate(
        { name: roomName },
        { $addToSet: { members: { username: sender, socketId } } }
      );
    }
    if (user1) {
      // if user is in room update socketId
      await RoomModel.findOneAndUpdate(
        { name: roomName, "members.username": receiver },
        { "members.$.socketId": socketId } // replace prev Id with the new socketId
      );
    } else {
      // if doesn't exist add it to members
       await RoomModel.findOneAndUpdate(
        { name: roomName },
        { $addToSet: { members: { username: receiver, socketId } } }
      );
    }
    return { receiver, roomName };
  } catch (error) {
    console.log(error);
  }
};

// on join if room exist ? joın : create
const createRoom = async (sender, receiver) => {
  try {
    const newRoom = await new RoomModel({ name: sender + receiver });

    const savedRoom = await newRoom.save();
    if (savedRoom._id) return savedRoom.name;
  } catch (error) {
    console.log(error);
  }
};
const getUsersInRoom = async (roomName) => {
  try {
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

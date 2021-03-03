const { Schema, model } = require("mongoose")

const RoomSchema = new Schema({
  name:{ type:String,required:true,unique:true } ,
  members: [{ username: String, socketId: String }],
})

module.exports = model("Room", RoomSchema)
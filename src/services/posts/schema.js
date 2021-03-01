const {Schema,model} = require('mongoose')
const PostSchema = new Schema({
    text:{
        type:String,
        required: true,
    },
    username:{type:String, required:true},
    user_id:{type:Schema.Types.ObjectId, ref:"Users"},
    comments:[{type:Schema.Types.ObjectId,ref:"Comments"}],
    likes:[{types:Schema.Types.ObjectId,ref:"Users"}],
    images:{type:String,required:true},
},
{timesstamps:true}
)
//push comments into posts

PostSchema.static("addCommentToPost",async (commentId,postId)=>{
    await PostModel.findByIdAndUpdate(postId,{$push:{comments:commentId}},{runValidators:true,new:true})


})
const PostModel = model("Posts",PostSchema)
module.exports =PostModel;
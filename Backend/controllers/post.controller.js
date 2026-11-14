import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { populate } from "dotenv";

export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;

    if (!image) return res.status(400).json({ message: "Image required" });

    //image upload

    const optimizedImage = await sharp(image.buffer)
      .resize({
        width: 800,
        height: 800,
        fit: "inside",
      })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    //buffer to dataUri

    const fileUri = `data:image/jpeg;base64,${optimizedImage.toString(`base64`)}`;
    const cloudResponse = await cloudinary.uploader.upload(fileUri);
    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });

    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post.id);
      await user.save();
    }

    await post.populate({ path: "author", select: "-password" });

    return res.status(201).json({
      message: "New post added",
      post,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllPost = async (req, res) => {
  try {
    const post = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username,profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username,profilePicture",
        },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username,profilePicture",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username,profilePicture",
        },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const likePost = async (req, res) => {
  try {
    const LikedBy = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({
        messege: "Post not found",
        success: false,
      });

    //Like logic started

    await post.updateOne({ $addToSet: { likes: LikedBy } });
    await post.save();

    //implementing socket.io for real time notification
    return res.status(200).json({
      message: "Post Liked",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const disLikePost = async (req, res) => {
  try {
    const LikedBy = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({
        messege: "Post not found",
        success: false,
      });

    //disLike logic started

    await post.updateOne({ $pull: { likes: LikedBy } });
    await post.save();

    //implementing socket.io for real time notification
    return res.status(200).json({
      message: "Post Disliked",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentedBy = req.id;

    const { text } = req.body;
    const post = await Post.findById(postId);
    if (!text)
      return res
        .status(400)
        .json({ messaeg: "Text not available", success: false });

    const comment = await Comment.create({
      text,
      author: commentedBy,
      post: postId,
    }).populate({
      path: "author",
      select: "username,profilePicture",
    });

    post.comments.push(comment.id);
    await post.save();

    return res.status(200).json({
      message: "Comment Added",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getCommentOfPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.find({
      post: postId,
    }).populate("author", "username,profilePicture");

    if (!comments)
      return res.status(404).json({
        message: "No comments found for this post",
        success: false,
      });

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.log(error);
  }
};

export const deletePost = async (req, res) => {
<<<<<<< HEAD
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if (!post)
            return res.status(404).json({
                message: "Post not found",
                success: false,
            });
        if (post.author.toString() != authorId)
            return res.status(403).json({ message: "Unauthorized" });
        await Post.findByIdAndDelete(postId);

        let user = await User.findById(authorId);
        user.posts = user.posts.filter((id) => id.toString() != postId);
        await user.save();

        await Comment.deleteMany({ post: postId });

        return res.status(200).json({
            success: true,
            message: "Post Deleted",
        });
    } catch (error) {
        console.log(error);
    }
};

export const bookMarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);
        if (!post)
            return res.status(404).json({
                message: "Post not found",
                success: false,
            });

        const user = await User.findById(authorId);
        if (user.bookmarks.includes(post.id)) {
            await user.updateOne({ $pull: { bookmarks: post.id } });
            await user.save();
            return res.status(200).json({
                type: "unsaved",
                message: "Post removed from bookmark",
                success: true,
            });
        } else {
            await user.updateOne({ $push: { bookmarks: post.id } });
            await user.save();
            return res.status(200).json({
                type: "saved",
                message: "Post bookmarked",
                success: true,
            });
        }
    } catch (error) {
        console.log(error);
    }
};
=======
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });

    if (post.author.toString() !== authorId)
      return res.status(403).json({
        message: "You are not authorized to delete this post",
        success: false,
      });

    //delete post

    await Post.findByAndDelete(postId);

    //remove the post id from the user's post
    let user = await User.findById(authorId);
    user.post = user.posts.filter((id) => id.toString() != postId);
    await user.save();

    //delete associated comments
    await Comment.deleteMany({ post: postId });

    return res.status(200).json({
      success: true,
      message: "Post deleted",
    });

  } catch (error) {
    console.log(error);
  }
};

export const bookMarkPost = async (req,res)=>{
  try {
    const postId = req.params.id;
    const 
  } catch (error) {
    console.log(error);
  }
}
>>>>>>> ea824c3b1e526a6c401d6ec03f6bef30d2e629d8

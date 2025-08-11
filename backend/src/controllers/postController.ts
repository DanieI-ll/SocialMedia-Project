import { Request, Response } from 'express';
import { createPost, getAllPosts, getUserPosts, updatePost, deletePost } from '../services/postService';
import Like from '../db/models/Like';
import Post from '../db/models/Post';
import Comment from '../db/models/Comment';

export const createPostController = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Файл обязателен' });
    const post = await createPost((req as any).user.id, req.body.description, req.file.path);
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const getPostsController = async (req: Request, res: Response) => {
  try {
    // Populate işlemi ile `author` verisini ve `isBlueVerified` alanını alıyoruz.
    // .sort({ createdAt: -1 }) ile postları en yeniden en eskiye sıralıyoruz.
    const posts = await Post.find().populate('author', 'username avatar isBlueVerified');

    const userId = (req as any).user?.id;

    const postsWithLikes = await Promise.all(
      posts.map(async (post: any) => {
        const likesCount = await Like.countDocuments({ post: post._id });
        const likedByUser = userId ? !!(await Like.findOne({ post: post._id, user: userId })) : false;
        return {
          ...post.toObject(),
          likesCount,
          likedByUser,
        };
      }),
    );

    res.json(postsWithLikes);
  } catch (err) {
    console.error('getPostsController error:', err);
    res.status(500).json({ message: 'Ошибка загрузки постов' });
  }
};

export const getUserPostsController = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find({ author: req.params.userId }).populate('author', 'username avatar isBlueVerified').sort({ createdAt: -1 });

    const userId = (req as any).user?.id;

    const postsWithDetails = await Promise.all(
      posts.map(async (post: any) => {
        const likesCount = await Like.countDocuments({ post: post._id });
        const likedByUser = userId ? !!(await Like.findOne({ post: post._id, user: userId })) : false;
        return {
          ...post.toObject(),
          likesCount,
          likedByUser,
        };
      }),
    );

    res.json(postsWithDetails);
  } catch (err) {
    console.error('getUserPostsController error:', err);
    res.status(500).json({ message: 'Посты пользователя не загружены' });
  }
};

export const updatePostController = async (req: Request, res: Response) => {
  try {
    const post = await updatePost(req.params.postId, (req as any).user.id, req.body.description, req.file?.path);
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const deletePostController = async (req: Request, res: Response) => {
  try {
    await deletePost(req.params.postId, (req as any).user.id);
    res.json({ message: 'Пост удалён' });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const getPostByIdController = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    // **DÜZELTİLMİŞ KOD:** isBlueVerified alanını ekledik
    const post = await Post.findById(postId).populate('author', 'username avatar isBlueVerified');

    if (!post) {
      return res.status(404).json({ message: 'Post bulunamadı.' });
    }

    const likesCount = await Like.countDocuments({ post: postId });

    const userId = (req as any).user?.id;
    let likedByUser = false;

    if (userId) {
      const like = await Like.findOne({ post: postId, user: userId });
      likedByUser = !!like;
    }

    // Yorum yapan kullanıcı bilgilerini çekerken de isBlueVerified'ı ekleyelim
    const comments = await Comment.find({ post: postId }).populate('user', 'username avatar isBlueVerified');

    const postWithDetails = {
      ...post.toObject(),
      likesCount,
      likedByUser,
      comments,
    };

    res.status(200).json(postWithDetails);
  } catch (error) {
    console.error('Post verisi çekilirken hata:', error);
    res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');

// ==================== POST ROUTES ====================

// Get all posts with optional filters
router.get('/posts', auth, async (req, res) => {
  try {
    const { skinType, productType, minRating } = req.query;
    let query = {};
    
    if (skinType && skinType !== 'All') {
      query.skinType = skinType;
    }
    if (productType && productType !== 'All') {
      query.productType = productType;
    }
    if (minRating && minRating > 0) {
      query.rating = { $gte: parseInt(minRating) };
    }
    
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(100);
    
    // Ensure likedBy is always an array
    const formattedPosts = posts.map(post => ({
      ...post.toObject(),
      likedBy: post.likedBy || [],
      likes: post.likes || 0,
      comments: post.comments || [],
      commentsCount: post.commentsCount || 0
    }));
    
    console.log(`Fetched ${formattedPosts.length} posts`);
    res.json(formattedPosts);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post by ID
router.get('/post/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    post.views = (post.views || 0) + 1;
    await post.save();
    
    res.json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create new post
router.post('/post', auth, async (req, res) => {
  try {
    console.log("Received post data:", req.body);
    
    const {
      productName,
      brand,
      productType,
      skinType,
      daysUsed,
      rating,
      review,
      beforeAfter,
      wouldRepurchase
    } = req.body;

    // Validate required fields
    if (!productName || !brand || !productType || !skinType || !daysUsed || !rating || !review) {
      console.log("Missing fields:", { productName, brand, productType, skinType, daysUsed, rating, review });
      return res.status(400).json({ 
        error: 'Missing required fields',
        missing: {
          productName: !productName,
          brand: !brand,
          productType: !productType,
          skinType: !skinType,
          daysUsed: !daysUsed,
          rating: !rating,
          review: !review
        }
      });
    }

    // Get user details
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Create new post
    const post = new Post({
      productName,
      brand,
      productType,
      skinType,
      daysUsed: parseInt(daysUsed),
      rating: parseInt(rating),
      review,
      beforeAfter: beforeAfter || '',
      wouldRepurchase: wouldRepurchase !== undefined ? wouldRepurchase : true,
      user: req.userId,
      userName: user.name,
      likes: 0,
      likedBy: [],
      views: 0,
      shares: 0,
      comments: [],
      commentsCount: 0
    });
    
    await post.save();
    console.log("Post saved successfully:", post._id);
    res.status(201).json(post);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: err.message || 'Failed to create post' });
  }
});

// Update post
router.put('/post/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }
    
    const allowedUpdates = ['review', 'beforeAfter', 'wouldRepurchase'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    
    res.json(updatedPost);
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post
router.delete('/post/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }
    
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ==================== LIKE ROUTES ====================

// Toggle like on a post
router.post('/post/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const userId = req.userId;
    
    // Initialize likedBy array if it doesn't exist
    if (!post.likedBy) {
      post.likedBy = [];
    }
    
    // Check if user already liked
    const hasLiked = post.likedBy.some(id => id.toString() === userId.toString());
    
    console.log(`User ${userId} hasLiked: ${hasLiked}`);
    console.log(`Current likes: ${post.likes}`);
    console.log(`Current likedBy array: ${post.likedBy.map(id => id.toString())}`);
    
    if (hasLiked) {
      // Unlike - remove user from likedBy array
      post.likedBy = post.likedBy.filter(id => id.toString() !== userId.toString());
      post.likes = Math.max(0, (post.likes || 0) - 1);
      console.log('Post unliked - new likes:', post.likes);
    } else {
      // Like - add user to likedBy array
      post.likedBy.push(userId);
      post.likes = (post.likes || 0) + 1;
      console.log('Post liked - new likes:', post.likes);
    }
    
    await post.save();
    
    // Always return JSON with status 200
    res.status(200).json({ 
      success: true,
      likes: post.likes,
      likedByUser: !hasLiked,
      likedBy: post.likedBy.map(id => id.toString())
    });
  } catch (err) {
    console.error('Error toggling like:', err);
    res.status(500).json({ error: 'Failed to process like' });
  }
});

// Get users who liked a post
router.get('/post/:id/likes', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('likedBy', 'name');
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({
      count: post.likes || 0,
      users: post.likedBy || []
    });
  } catch (err) {
    console.error('Error fetching likes:', err);
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
});

// ==================== COMMENT ROUTES ====================

// Get comments for a post
router.get('/post/:id/comments', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const comments = (post.comments || []).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add comment to a post
router.post('/post/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const comment = {
      userName: user.name,
      text: text.trim(),
      createdAt: new Date()
    };
    
    if (!post.comments) {
      post.comments = [];
    }
    
    post.comments.push(comment);
    post.commentsCount = (post.commentsCount || 0) + 1;
    
    await post.save();
    
    const savedComment = post.comments[post.comments.length - 1];
    res.status(201).json({
      ...savedComment.toObject(),
      _id: savedComment._id
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete a comment
router.delete('/post/:postId/comment/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    comment.deleteOne();
    post.commentsCount = Math.max(0, (post.commentsCount || 0) - 1);
    
    await post.save();
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;
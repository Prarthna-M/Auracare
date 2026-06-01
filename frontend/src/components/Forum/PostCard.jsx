import { useState, useEffect } from "react";

function PostCard({ post, onLike }) {
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  // Initialize local likes when post changes
  useEffect(() => {
    if (post) {
      console.log("Post data received:", {
        id: post._id,
        likes: post.likes,
        likedBy: post.likedBy,
        userId: localStorage.getItem("userId")
      });
      setLocalLikes(post.likes || 0);
      checkIfLiked();
    }
  }, [post]);

  const checkIfLiked = () => {
    try {
      const currentUserId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      
      console.log("Checking if liked - UserId:", currentUserId);
      console.log("Post likedBy array:", post?.likedBy);
      
      if (!token || !currentUserId || !post?.likedBy) {
        console.log("Missing data - setting isLiked=false");
        setIsLiked(false);
        return;
      }

      // Check if current user is in likedBy array
      let liked = false;
      if (Array.isArray(post.likedBy)) {
        liked = post.likedBy.some(userId => {
          const idStr = userId?.toString?.() || userId;
          const match = idStr === currentUserId.toString();
          if (match) console.log("Found match for user:", idStr);
          return match;
        });
      }
      
      console.log("Final isLiked value:", liked);
      setIsLiked(liked);
    } catch (err) {
      console.log("Like check error:", err);
      setIsLiked(false);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`http://localhost:5000/api/community/post/${post._id}/comments`, {
        method: "GET",
        headers: { 
          "Authorization": token,
          "Content-Type": "application/json"
        }
      });
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const data = await res.json();
      setComments(data || []);
    } catch (err) {
      console.log("Error fetching comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to like posts");
        return;
      }

      console.log("===== LIKE BUTTON CLICKED =====");
      console.log("Current isLiked state:", isLiked);
      console.log("Current localLikes:", localLikes);
      
      // Optimistic update - update UI immediately
      const newLikedState = !isLiked;
      console.log("Optimistic update - setting isLiked to:", newLikedState);
      setIsLiked(newLikedState);
      setLocalLikes(prev => newLikedState ? prev + 1 : prev - 1);

      console.log("Sending request to:", `http://localhost:5000/api/community/post/${post._id}/like`);
      
      const res = await fetch(`http://localhost:5000/api/community/post/${post._id}/like`, {
        method: "POST",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        }
      });
      
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        console.error("API call failed, reverting optimistic update");
        // If API fails, revert the optimistic update
        setIsLiked(!newLikedState);
        setLocalLikes(prev => newLikedState ? prev - 1 : prev + 1);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Server response data:", data);
      
      // Update with actual server response
      setIsLiked(data.likedByUser);
      setLocalLikes(data.likes);
      console.log("Updated state - isLiked:", data.likedByUser, "likes:", data.likes);
      
      // Update the post object for future checks
      if (post) {
        post.likes = data.likes;
        post.likedBy = data.likedBy;
      }
      
      // Call parent callback if provided
      if (onLike) {
        onLike(post._id, data.likes);
      }
      
      console.log("===== LIKE BUTTON COMPLETE =====");
    } catch (err) {
      console.log("Error liking post:", err);
      alert("Failed to like post. Please try again.");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to comment");
      return;
    }

    setPostingComment(true);
    const commentText = newComment.trim();

    try {
      const res = await fetch(`http://localhost:5000/api/community/post/${post._id}/comment`, {
        method: "POST",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: commentText })
      });
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      const newCommentData = await res.json();
      setComments(prev => [...prev, newCommentData]);
      setNewComment("");
    } catch (err) {
      console.log("Error adding comment:", err);
    } finally {
      setPostingComment(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          style={{ color: i <= rating ? "#F4A261" : "#E8E0D5" }}
        >
          ★
        </span>
      );
    }
    return stars;
  };
  
  const getProductTypeColor = (type) => {
    const colors = {
      'Cleanser': { bg: "#FFF5F0", text: "#D47B5C" },
      'Serum': { bg: "#E8F0E0", text: "#6B8C42" },
      'Moisturizer': { bg: "#F5F0EB", text: "#A98899" },
      'Sunscreen': { bg: "#FFE8E0", text: "#D47B5C" },
      'Toner': { bg: "#FFF0F0", text: "#DCAAAB" },
      'Mask': { bg: "#F0EBF5", text: "#A98899" },
      'Treatment': { bg: "#E0F0E8", text: "#6B8C42" }
    };
    return colors[type] || { bg: "#F5F0EB", text: "#6B584C" };
  };

  const getSkinTypeColor = (type) => {
    const colors = {
      'Oily': { bg: "#FFF5F0", text: "#D47B5C" },
      'Dry': { bg: "#F5F0EB", text: "#A98899" },
      'Combination': { bg: "#FFE8E0", text: "#D47B5C" },
      'Sensitive': { bg: "#E8F0E0", text: "#6B8C42" },
      'Normal': { bg: "#F0F0F0", text: "#6B584C" }
    };
    return colors[type] || { bg: "#F5F0EB", text: "#6B584C" };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recent";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Recent";
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (err) {
      return "Recent";
    }
  };

  const productTypeColor = getProductTypeColor(post?.productType);
  const skinTypeColor = getSkinTypeColor(post?.skinType);

  return (
    <div style={{
      background: "white",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      transition: "all 0.3s ease"
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
    onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
    >
      {/* Product Header */}
      <div style={{
        background: "linear-gradient(135deg, #FFF5F0 0%, #FFE8E0 100%)",
        padding: "20px",
        borderBottom: "1px solid #FFE0D0"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#4A372F", margin: 0 }}>
                {post?.productName || "Product"}
              </h3>
              <span style={{
                background: "#6B8C42",
                color: "white",
                fontSize: "10px",
                padding: "2px 8px",
                borderRadius: "20px"
              }}>
                ✓ Verified
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "#A98899", marginTop: "4px" }}>
              {post?.brand || "Brand"}
            </p>
          </div>
          <span style={{
            background: productTypeColor.bg,
            color: productTypeColor.text,
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "11px",
            fontWeight: "600"
          }}>
            {post?.productType || "Product"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "16px" }}>

        {/* Rating and Days */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ fontSize: "18px", display: "flex", gap: "2px" }}>
              {renderStars(post?.rating || 0)}
            </div>
            <span style={{ fontSize: "11px", color: "#A98899" }}>{post?.rating || 0}/5</span>
          </div>
          <span style={{
            background: "#F5F0EB",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            color: "#6B584C"
          }}>
            📅 {post?.daysUsed || 0} days
          </span>
        </div>

        {/* User Info */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
          <span style={{
            background: "#F5F0EB",
            color: "#D47B5C",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
            👤 {post?.userName || "User"}
          </span>
          <span style={{
            background: skinTypeColor.bg,
            color: skinTypeColor.text,
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "11px"
          }}>
            {post?.skinType || "Normal"}
          </span>
        </div>

        {/* Review */}
        <p style={{
          color: "#6B584C",
          fontSize: "13px",
          lineHeight: "1.5",
          marginBottom: "12px",
          ...(!isExpanded && {
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          })
        }}>
          {post?.review || "No review text"}
        </p>
        
        {post?.review && post.review.length > 150 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: "none",
              border: "none",
              color: "#D47B5C",
              fontSize: "12px",
              cursor: "pointer",
              marginBottom: "12px",
              padding: 0
            }}
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Before/After if exists */}
        {post?.beforeAfter && (
          <div style={{
            background: "#FFF5F0",
            padding: "12px",
            borderRadius: "12px",
            marginBottom: "12px",
            borderLeft: "3px solid #D47B5C"
          }}>
            <span style={{ fontWeight: "600", color: "#D47B5C", fontSize: "12px" }}>✨ Results: </span>
            <span style={{ color: "#6B584C", fontSize: "12px" }}>{post.beforeAfter}</span>
          </div>
        )}

        {/* Repurchase */}
        <div style={{ marginBottom: "12px" }}>
          {post?.wouldRepurchase ? (
            <span style={{
              background: "#E8F0E0",
              color: "#6B8C42",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "11px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}>
              ❤️ Would Repurchase
            </span>
          ) : (
            <span style={{
              background: "#FCE8E8",
              color: "#DCAAAB",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "11px",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px"
            }}>
              ❌ Would Not Repurchase
            </span>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #FFE0D0", paddingTop: "12px" }}>
          
          {/* Date and Stats */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "#A98899", marginBottom: "12px" }}>
            <span>{formatDate(post?.createdAt)}</span>
            
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                ❤️ {localLikes}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                💬 {comments.length || post?.commentsCount || 0}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button 
              onClick={handleLike}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "30px",
                fontSize: "12px",
                fontWeight: "500",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                background: isLiked ? "#FCE8E8" : "#F5F0EB",
                color: isLiked ? "#DCAAAB" : "#6B584C"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <span style={{ fontSize: "14px" }}>{isLiked ? '❤️' : '🤍'}</span>
              <span>{isLiked ? 'Liked' : 'Like'}</span>
            </button>

            <button 
              onClick={() => {
                setShowComments(!showComments);
                if (!showComments && comments.length === 0) {
                  fetchComments();
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "30px",
                fontSize: "12px",
                fontWeight: "500",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s",
                background: "#F5F0EB",
                color: "#6B584C"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <span>💬</span>
              Comment
            </button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #FFE0D0" }}>
              
              {/* Comments List */}
              <div style={{
                maxHeight: "240px",
                overflowY: "auto",
                marginBottom: "16px",
                paddingRight: "8px"
              }}>
                {loadingComments ? (
                  <p style={{ textAlign: "center", color: "#A98899", padding: "16px" }}>Loading comments...</p>
                ) : comments.length > 0 ? (
                  comments.map((comment, idx) => (
                    <div key={idx} style={{
                      background: "#FFF9F5",
                      padding: "12px",
                      borderRadius: "12px",
                      marginBottom: "8px"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontWeight: "600", fontSize: "12px", color: "#D47B5C" }}>{comment.userName}</span>
                        <span style={{ fontSize: "10px", color: "#A98899" }}>
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", color: "#6B584C", margin: 0 }}>{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: "center", color: "#A98899", padding: "16px", fontSize: "12px" }}>
                    No comments yet. Be the first!
                  </p>
                )}
              </div>

              {/* Add Comment Input */}
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "1px solid #FFE0D0",
                    borderRadius: "30px",
                    fontSize: "12px",
                    background: "#FFF9F5",
                    color: "#4A372F",
                    outline: "none"
                  }}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  disabled={postingComment}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || postingComment}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "30px",
                    fontSize: "12px",
                    fontWeight: "500",
                    border: "none",
                    cursor: !newComment.trim() || postingComment ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                    background: !newComment.trim() || postingComment ? "#F5F0EB" : "#D47B5C",
                    color: !newComment.trim() || postingComment ? "#A98899" : "white"
                  }}
                >
                  {postingComment ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PostCard;
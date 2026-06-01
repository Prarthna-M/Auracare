import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/Forum/PostCard";
import FilterBar from "../components/Forum/Filterbar";
import NewPostForm from "../components/Forum/NewPostForm";

function CommunityForum() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    skinType: "All",
    productType: "All",
    minRating: 0,
    sortBy: "newest"
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchPosts();
    }
  }, []);

  useEffect(() => {
    filterAndSortPosts();
  }, [posts, filters]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/community/posts", {
        headers: { "Authorization": token }
      });
      
      if (res.status === 401) {
        const errorData = await res.json();
        if (errorData.expired || errorData.message === 'Token expired') {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          alert("Session expired. Please login again.");
          navigate("/login");
          return;
        }
        throw new Error('Unauthorized');
      }
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Fetched posts:", data);
      console.log("First post likedBy:", data[0]?.likedBy);
      console.log("Current user ID:", localStorage.getItem("userId"));
      
      const postsWithComments = data.map(post => ({
        ...post,
        comments: post.comments || [],
        likedBy: post.likedBy || []
      }));
      setPosts(postsWithComments);
      setLoading(false);
    } catch (err) {
      console.log("Error fetching posts:", err);
      setLoading(false);
    }
  };

  const filterAndSortPosts = () => {
    let filtered = [...posts];

    if (filters.skinType !== "All") {
      filtered = filtered.filter(post => post.skinType === filters.skinType);
    }

    if (filters.productType !== "All") {
      filtered = filtered.filter(post => post.productType === filters.productType);
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter(post => post.rating >= filters.minRating);
    }

    switch(filters.sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "highestRated":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "mostUsed":
        filtered.sort((a, b) => b.daysUsed - a.daysUsed);
        break;
      default:
        break;
    }

    setFilteredPosts(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePostCreated = () => {
    setShowPostForm(false);
    fetchPosts();
  };

  // Update a specific post in the state after like
  const updatePostLikes = (postId, newLikes, likedByUser) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === postId 
          ? { 
              ...post, 
              likes: newLikes,
              likedBy: likedByUser 
                ? [...(post.likedBy || []), localStorage.getItem("userId")]
                : (post.likedBy || []).filter(id => id !== localStorage.getItem("userId"))
            }
          : post
      )
    );
  };

  return (
    <div style={{ background: "linear-gradient(135deg, #FFF5F0 0%, #FFE8E0 100%)", minHeight: "100vh" }}>
      
      {/* Navigation Bar */}
      <nav style={{ background: "white", boxShadow: "0 2px 20px rgba(0,0,0,0.05)", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 
            onClick={() => navigate("/")}
            className="text-2xl font-bold cursor-pointer transition-opacity hover:opacity-80"
            style={{ color: "#D47B5C" }}
          >
            Auracare
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/routine")}
              className="px-4 py-2 rounded-lg transition-all hover:bg-opacity-10"
              style={{ color: "#6B584C", background: "transparent" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#F5F0EB"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              My Routine
            </button>
            <button
              onClick={() => navigate("/chemical-checker")}
              className="px-4 py-2 rounded-lg transition-all hover:bg-opacity-10"
              style={{ color: "#6B584C", background: "transparent" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#F5F0EB"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              Check Ingredients
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="px-5 py-2 rounded-full font-medium transition-all hover:shadow-md"
              style={{ background: "#D47B5C", color: "white" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              Profile
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 style={{ fontSize: "42px", fontWeight: "bold", color: "#4A372F", marginBottom: "8px" }}>
              Community Forum
            </h1>
            <p style={{ color: "#6B584C" }}>
              Share experiences, read reviews, and help others make informed skincare choices
            </p>
          </div>
          <button
            onClick={() => setShowPostForm(!showPostForm)}
            style={{
              background: showPostForm ? "#DCAAAB" : "#D47B5C",
              color: "white",
              padding: "12px 24px",
              borderRadius: "40px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 8px rgba(212, 123, 92, 0.2)"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {showPostForm ? "✕ Cancel" : "✎ Share Experience"}
          </button>
        </div>

        {/* New Post Form */}
        {showPostForm && (
          <div className="mb-8">
            <NewPostForm onPostCreated={handlePostCreated} />
          </div>
        )}

        {/* Filters */}
        <FilterBar filters={filters} onFilterChange={handleFilterChange} />

        {/* Stats */}
        <div style={{ background: "white", borderRadius: "20px", padding: "16px 20px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ color: "#6B584C" }}>
            Showing <span style={{ fontWeight: "bold", color: "#D47B5C" }}>{filteredPosts.length}</span> reviews
          </div>
          <div style={{ fontSize: "13px", color: "#A98899" }}>
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-3" style={{ borderColor: "#D47B5C", borderTopColor: "transparent" }}></div>
            <p className="mt-4" style={{ color: "#6B584C" }}>Loading reviews...</p>
          </div>
        ) : (
          <>
            {filteredPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <PostCard 
                    key={post._id} 
                    post={post} 
                    onLike={updatePostLikes}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "60px", background: "white", borderRadius: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                <p style={{ color: "#6B584C", fontSize: "18px", marginBottom: "12px" }}>No reviews match your filters</p>
                <button
                  onClick={() => setFilters({ skinType: "All", productType: "All", minRating: 0, sortBy: "newest" })}
                  style={{ color: "#D47B5C", fontWeight: "500", cursor: "pointer", background: "none", border: "none" }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CommunityForum;
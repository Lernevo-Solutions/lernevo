import React, { useState } from "react";
import {
  Heart,
  Brain,
  Apple,
  Activity,
  Clock,
  User,
  BookOpen,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Eye
} from "lucide-react";
import "./Blog.css";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Posts", icon: BookOpen },
    { id: "ai", name: "AI Coaching", icon: Sparkles },
    { id: "fitness", name: "Fitness", icon: Activity },
    { id: "nutrition", name: "Nutrition", icon: Apple },
    { id: "mental", name: "Mental Wellness", icon: Brain }
  ];

  const blogPosts = [
    {
      id: 1,
      title: "The Future of Holistic Health",
      excerpt: "How AI is transforming body & mind wellness.",
      category: "ai",
      author: "Dr. Sarah Chen",
      readTime: "5 min read",
      date: "Feb 24, 2026",
      views: "2.5K"
    },
    {
      id: 2,
      title: "5 Morning Rituals for Mental Clarity",
      excerpt: "Science-backed practices for focus.",
      category: "mental",
      author: "Maya Patel",
      readTime: "4 min read",
      date: "Feb 22, 2026",
      views: "1.8K"
    }
  ];

  const filteredPosts =
    selectedCategory === "all"
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  return (
    <div className="blog-page">
      <div className="blog-container">

        <div className="blog-header">
          <Heart className="blog-logo" />
          <h1>LERNEVO Blog</h1>
        </div>

        <div className="blog-categories">
          {categories.map((category) => (
            <button
              key={category.id}
              className={
                selectedCategory === category.id
                  ? "category active"
                  : "category"
              }
              onClick={() => setSelectedCategory(category.id)}
            >
              <category.icon size={14} />
              {category.name}
            </button>
          ))}
        </div>

        <div className="blog-grid">
          {filteredPosts.map((post) => (
            <div key={post.id} className="blog-card">
              <div className="blog-card-top">
                <span className="blog-category">{post.category}</span>
                <span className="blog-date">{post.date}</span>
              </div>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>

              <div className="blog-meta">
                <span><User size={12} /> {post.author}</span>
                <span><Clock size={12} /> {post.readTime}</span>
                <span><Eye size={12} /> {post.views}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Blog;
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Article } from "../types";
import { LazyImage } from "./LazyImage";
import "../../styles/blog-card.css";

interface BlogCardProps {
  post: Article;
  showOverlay?: boolean;
}

export function BlogCard({ post, showOverlay }: BlogCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 12 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isHovered) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const maxRotation = 15;
    const rotateY = (mouseX / (rect.width / 2)) * maxRotation;
    const rotateX = -(mouseY / (rect.height / 2)) * maxRotation;

    setTransform({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 15 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setTransform({ rotateX: 0, rotateY: 0 });
    setIsHovered(true);
  };

  return (
    <div
      ref={cardRef}
      className="blog-card-3d-wrapper"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <article
        className="blog-card-3d"
        style={{
          transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg)`,
        }}
      >
        <Link to={`/home/blog/${post.id}`} className="blog-card-link">
          <div className="blog-card-image-wrapper">
            <LazyImage
              src={post.imageUrl}
              alt={post.title}
              className="blog-card-image"
              rootMargin="200px"
            />
            <div className={`blog-card-overlay font-tangyinghei ${(isHovered || showOverlay) ? "visible" : ""}`}>
              <div className="blog-card-content">
                <h3 className="blog-card-title">{post.title}</h3>

                <p className="blog-card-excerpt">{post.excerpt}</p>

                <div className="blog-card-footer">
                  <div className="blog-card-stats">
                    <span className="stat-item">
                      <Heart className="stat-icon" />
                      {post.likes || 0}
                    </span>
                  </div>
                  <span className="read-more">阅读更多 →</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </article>
    </div>
  );
}

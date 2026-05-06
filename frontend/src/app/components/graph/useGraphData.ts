import { useState, useEffect } from "react";
import { articleApi, categoryApi, tagApi } from "../../services/api";
import { Article, Category, TagType } from "../../types";
import { GraphData, GraphNode, GraphLink } from "./graphTypes";

const COLORS = {
  article: "#22d3ee",
  tag: "#f59e0b",
  category: "#a78bfa",
};

function buildGraphData(articles: Article[], categories: Category[], tagMap: Map<number, TagType>): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  // Category hub nodes
  for (const cat of categories) {
    nodes.push({
      id: `cat-${cat.id}`,
      type: "category",
      name: cat.name,
      val: 6,
      color: COLORS.category,
      categoryId: cat.id,
    });
  }

  // Article nodes + links
  for (const article of articles) {
    const size = Math.max(3, Math.min(12, 2 + Math.log(article.viewCount + 1)));
    nodes.push({
      id: `article-${article.id}`,
      type: "article",
      name: article.title,
      val: size,
      color: COLORS.article,
      articleId: article.id,
      viewCount: article.viewCount,
    });

    // Link to category
    links.push({
      source: `article-${article.id}`,
      target: `cat-${article.categoryId}`,
    });

    // Process tags
    const tags = article.tags || [];
    for (const tag of tags) {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, tag);
        nodes.push({
          id: `tag-${tag.id}`,
          type: "tag",
          name: tag.name,
          val: 4,
          color: COLORS.tag,
          tagId: tag.id,
        });
      }
      links.push({
        source: `article-${article.id}`,
        target: `tag-${tag.id}`,
      });
    }
  }

  return { nodes, links };
}

export function useGraphData() {
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const [articles, categories] = await Promise.all([
          articleApi.getArticles(),
          categoryApi.getCategories(),
        ]);

        if (cancelled) return;

        // Check if tags are populated; if not, fetch them per article
        const needsTagFetch = articles.length > 0 && (!articles[0].tags || articles[0].tags.length === 0);

        let tagMap = new Map<number, TagType>();

        if (needsTagFetch) {
          const tagResults = await Promise.all(
            articles.map((a) => tagApi.getTagsByArticleId(a.id).catch(() => [] as TagType[]))
          );
          if (cancelled) return;

          // Attach fetched tags to articles
          articles.forEach((article, i) => {
            article.tags = tagResults[i];
          });
        }

        if (cancelled) return;

        const graphData = buildGraphData(articles, categories, tagMap);
        setData(graphData);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load graph data:", err);
          setError("加载知识图谱数据失败");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

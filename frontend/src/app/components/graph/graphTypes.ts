export type NodeType = "article" | "tag" | "category";

export interface GraphNode {
  id: string;
  type: NodeType;
  name: string;
  val: number;
  color: string;
  articleId?: number;
  tagId?: number;
  categoryId?: number;
  viewCount?: number;
  // d3-force sets these
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

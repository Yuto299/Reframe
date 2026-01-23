// Domain Model: Knowledge
export interface Knowledge {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    connections: string[]; // Array of connected knowledge IDs
}

export interface CreateKnowledgeInput {
    title: string;
    content: string;
}

export interface SearchResult {
    knowledge: Knowledge;
    relevanceScore: number;
}

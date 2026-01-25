import { Knowledge, CreateKnowledgeInput, SearchResult } from '../models/Knowledge.js';

// Repository Interface (Port)
export interface KnowledgeRepository {
    // Get all knowledge
    findAll(): Promise<Knowledge[]>;

    // Get knowledge by ID
    findById(id: string): Promise<Knowledge | null>;

    // Search knowledge by query
    search(query: string): Promise<SearchResult[]>;

    // Create new knowledge
    create(input: CreateKnowledgeInput): Promise<Knowledge>;

    // Add connection between two knowledge items
    addConnection(sourceId: string, targetId: string): Promise<void>;

    // Remove connection between two knowledge items
    removeConnection(sourceId: string, targetId: string): Promise<void>;
}

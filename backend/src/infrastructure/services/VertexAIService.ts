import { VertexAI, GenerativeModel } from '@google-cloud/vertexai';

/**
 * Vertex AIサービスの設定
 */
export interface VertexAIConfig {
    project: string;
    location: string;
}

/**
 * トピック分割結果
 */
export interface TopicSegment {
    title: string;
    content: string;
}

/**
 * Vertex AIサービス
 * Generative AI APIとEmbeddings APIを提供
 */
export class VertexAIService {
    private vertexAI: VertexAI;
    private generativeModel: GenerativeModel;
    private config: VertexAIConfig;

    constructor(config?: Partial<VertexAIConfig>) {
        this.config = {
            project: config?.project ?? process.env.GOOGLE_CLOUD_PROJECT ?? '',
            location: config?.location ?? process.env.VERTEX_AI_LOCATION ?? 'asia-northeast1',
        };

        if (!this.config.project) {
            throw new Error('GOOGLE_CLOUD_PROJECT environment variable is required');
        }

        this.vertexAI = new VertexAI({
            project: this.config.project,
            location: this.config.location,
        });

        this.generativeModel = this.vertexAI.getGenerativeModel({
            model: 'gemini-pro',
        });
    }

    /**
     * テキストを複数のトピックに分割
     * @param text 入力テキスト
     * @returns 分割されたトピックのリスト
     */
    async segmentTopics(text: string): Promise<TopicSegment[]> {
        if (!text || text.trim().length === 0) {
            return [];
        }

        const prompt = `以下のテキストを、独立した話題ごとに分割してください。
各話題には、タイトルと内容を含めてください。
出力形式はJSON配列で、各要素は以下の形式にしてください：
[
  {
    "title": "話題のタイトル",
    "content": "話題の内容"
  }
]

テキスト：
${text}

JSON配列のみを返してください。説明や追加のテキストは含めないでください。`;

        try {
            const result = await this.generativeModel.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
            });

            const response = result.response;
            const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!responseText) {
                throw new Error('No response from Vertex AI');
            }

            // JSONを抽出（```json や ``` で囲まれている可能性がある）
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('Invalid response format from Vertex AI');
            }

            const topics = JSON.parse(jsonMatch[0]) as TopicSegment[];

            // バリデーション
            if (!Array.isArray(topics)) {
                throw new Error('Response is not an array');
            }

            return topics.filter((topic) => {
                return (
                    topic &&
                    typeof topic.title === 'string' &&
                    typeof topic.content === 'string' &&
                    topic.title.trim().length > 0 &&
                    topic.content.trim().length > 0
                );
            });
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(`Failed to parse Vertex AI response: ${error.message}`);
            }
            throw error instanceof Error
                ? error
                : new Error(`Failed to segment topics: ${String(error)}`);
        }
    }

    /**
     * テキストの埋め込みベクトルを生成
     * @param text 入力テキスト
     * @returns 埋め込みベクトル（768次元）
     */
    async generateEmbedding(text: string): Promise<number[]> {
        if (!text || text.trim().length === 0) {
            throw new Error('Text cannot be empty');
        }

        try {
            // Embeddings APIは別のエンドポイントを使用
            // 現時点では、Generative Modelを使用して簡易的に実装
            // 本番環境では、textembedding-gecko@003を使用することを推奨
            const result = await this.vertexAI.preview.getGenerativeModel({
                model: 'textembedding-gecko@003',
            }).embedContent({
                content: { parts: [{ text: text.trim() }] },
            });

            const embedding = result.embedding?.values;
            if (!embedding || embedding.length === 0) {
                throw new Error('No embedding generated');
            }

            return embedding;
        } catch (error) {
            throw error instanceof Error
                ? error
                : new Error(`Failed to generate embedding: ${String(error)}`);
        }
    }

    /**
     * 2つの埋め込みベクトルのコサイン類似度を計算
     * @param vec1 ベクトル1
     * @param vec2 ベクトル2
     * @returns コサイン類似度（0-1の範囲）
     */
    cosineSimilarity(vec1: number[], vec2: number[]): number {
        if (vec1.length !== vec2.length) {
            throw new Error('Vectors must have the same length');
        }

        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }

        const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
        if (denominator === 0) {
            return 0;
        }

        return dotProduct / denominator;
    }
}

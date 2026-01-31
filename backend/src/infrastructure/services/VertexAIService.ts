import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Vertex AIサービスの設定
 */
export interface VertexAIConfig {
  apiKey?: string; // Google AI Studio APIキー
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
 * Google AI Studio APIキーを使用してGenerative AI APIとEmbeddings APIを提供
 */
export class VertexAIService {
  private genAI: GoogleGenerativeAI;
  private config: VertexAIConfig;

  constructor(config?: Partial<VertexAIConfig>) {
    const apiKey = config?.apiKey ?? process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY environment variable is required");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.config = { apiKey };
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
      // Google AI Studioで使用可能なモデル名
      // gemini-2.5-flash が安定版で推奨
      // 参考: https://ai.google.dev/gemini-api/docs/models/gemini
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      if (!responseText) {
        throw new Error("No response from Generative AI");
      }

      // JSONを抽出（```json や ``` で囲まれている可能性がある）
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Invalid response format from Generative AI");
      }

      const topics = JSON.parse(jsonMatch[0]) as TopicSegment[];

      // バリデーション
      if (!Array.isArray(topics)) {
        throw new Error("Response is not an array");
      }

      return topics.filter((topic) => {
        return (
          topic &&
          typeof topic.title === "string" &&
          typeof topic.content === "string" &&
          topic.title.trim().length > 0 &&
          topic.content.trim().length > 0
        );
      });
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(
          `Failed to parse Generative AI response: ${error.message}`,
        );
      }
      throw error instanceof Error
        ? error
        : new Error(`Failed to segment topics: ${String(error)}`);
    }
  }

  /**
   * テキストの埋め込みベクトルを生成
   * @param text 入力テキスト
   * @returns 埋め込みベクトル
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      throw new Error("Text cannot be empty");
    }

    try {
      // Google AI StudioのAPIキーを使用してEmbeddings APIを呼び出し
      const apiKey = this.config.apiKey!;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "models/text-embedding-004",
            content: {
              parts: [{ text: text.trim() }],
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to generate embedding: ${response.status} ${errorText}`,
        );
      }

      const data = (await response.json()) as {
        embedding?: { values?: number[] };
      };
      const embedding = data.embedding?.values;
      if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
        throw new Error("No embedding generated");
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
      throw new Error("Vectors must have the same length");
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

import { Knowledge, CreateKnowledgeInput, SearchResult } from '@/domain/models/Knowledge';
import { KnowledgeRepository } from '@/domain/repositories/KnowledgeRepository';

// Mock data storage
let mockKnowledgeData: Knowledge[] = [
    {
        id: '1',
        title: 'React Hooks の基本',
        content: 'React Hooksは関数コンポーネントで状態管理や副作用を扱うための機能。useState, useEffect, useContextなどがある。クラスコンポーネントを使わずに、よりシンプルで再利用可能なコードが書ける。',
        createdAt: new Date('2024-01-15'),
        connections: ['2', '3'],
    },
    {
        id: '2',
        title: 'useEffect の依存配列',
        content: 'useEffectの第二引数に渡す依存配列は、エフェクトの再実行タイミングを制御する。空配列を渡すとマウント時のみ実行、省略すると毎レンダリング時に実行される。適切な依存関係の指定が重要。',
        createdAt: new Date('2024-01-16'),
        connections: ['1', '4'],
    },
    {
        id: '3',
        title: 'カスタムフックの作成',
        content: 'カスタムフックは、ロジックを再利用可能な関数として切り出す手法。useで始まる名前をつけ、内部で他のHooksを使用できる。コンポーネント間でロジックを共有する際に便利。',
        createdAt: new Date('2024-01-17'),
        connections: ['1'],
    },
    {
        id: '4',
        title: 'パフォーマンス最適化',
        content: 'React.memo, useMemo, useCallbackを使って不要な再レンダリングを防ぐ。ただし、過度な最適化は逆効果。プロファイラーで計測してから最適化するのがベストプラクティス。',
        createdAt: new Date('2024-01-18'),
        connections: ['2', '5'],
    },
    {
        id: '5',
        title: 'useCallback の使い所',
        content: 'useCallbackは関数をメモ化するHook。子コンポーネントにpropsとして渡す関数や、useEffectの依存配列に含まれる関数に使用する。不要な再レンダリングを防ぐ。',
        createdAt: new Date('2024-01-19'),
        connections: ['4'],
    },
    {
        id: '6',
        title: 'TypeScriptの型推論',
        content: 'TypeScriptは変数の型を自動的に推論する。明示的な型注釈がなくても、代入される値から型を判断。ただし、複雑な場合は明示的に型を指定した方が可読性が高い。',
        createdAt: new Date('2024-01-20'),
        connections: ['7'],
    },
    {
        id: '7',
        title: 'ジェネリクス型',
        content: 'ジェネリクスは型を抽象化し、再利用可能なコンポーネントや関数を作成する機能。Array<T>やPromise<T>などが代表例。型安全性を保ちながら柔軟なコードが書ける。',
        createdAt: new Date('2024-01-21'),
        connections: ['6', '8'],
    },
    {
        id: '8',
        title: 'ユニオン型とインターセクション型',
        content: 'ユニオン型(A | B)は複数の型のいずれかを表し、インターセクション型(A & B)は複数の型を組み合わせる。柔軟な型定義が可能になる。',
        createdAt: new Date('2024-01-22'),
        connections: ['7'],
    },
    {
        id: '9',
        title: 'Next.js の App Router',
        content: 'Next.js 13以降で導入されたApp Routerは、ファイルシステムベースのルーティング。Server ComponentsとClient Componentsを使い分けることで、パフォーマンスが向上。',
        createdAt: new Date('2024-01-23'),
        connections: ['10'],
    },
    {
        id: '10',
        title: 'Server Components vs Client Components',
        content: 'Server Componentsはサーバー側でレンダリングされ、JavaScriptバンドルサイズを削減。Client Componentsはインタラクティブな機能に使用。"use client"ディレクティブで明示的に指定。',
        createdAt: new Date('2024-01-24'),
        connections: ['9', '11'],
    },
    {
        id: '11',
        title: 'データフェッチングの戦略',
        content: 'Next.jsではSSR, SSG, ISR, CSRなど複数のデータフェッチング戦略がある。ページの性質に応じて適切な戦略を選択することが重要。App Routerではfetch APIが拡張されている。',
        createdAt: new Date('2024-01-25'),
        connections: ['10'],
    },
    {
        id: '12',
        title: 'ヘキサゴナルアーキテクチャ',
        content: 'ポートアンドアダプターパターンとも呼ばれる。ビジネスロジックを外部依存から分離し、テスタビリティと保守性を向上させる設計手法。ドメイン層を中心に、インフラ層とプレゼンテーション層を分離。',
        createdAt: new Date('2024-01-26'),
        connections: ['13'],
    },
    {
        id: '13',
        title: 'DDD (ドメイン駆動設計)',
        content: 'ビジネスドメインの複雑さに焦点を当てた設計手法。エンティティ、値オブジェクト、集約、リポジトリなどの概念を使い、ドメインモデルを構築。ユビキタス言語の使用が重要。',
        createdAt: new Date('2024-01-27'),
        connections: ['12', '14'],
    },
    {
        id: '14',
        title: 'リポジトリパターン',
        content: 'データアクセスロジックをカプセル化し、ドメイン層から分離するパターン。インターフェースを定義し、具体的な実装は差し替え可能にする。テストが容易になる。',
        createdAt: new Date('2024-01-28'),
        connections: ['13'],
    },
];

export class MockKnowledgeRepository implements KnowledgeRepository {
    async findAll(): Promise<Knowledge[]> {
        // Simulate async operation
        return new Promise((resolve) => {
            setTimeout(() => resolve([...mockKnowledgeData]), 100);
        });
    }

    async findById(id: string): Promise<Knowledge | null> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const knowledge = mockKnowledgeData.find((k) => k.id === id);
                resolve(knowledge || null);
            }, 50);
        });
    }

    async search(query: string): Promise<SearchResult[]> {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (!query.trim()) {
                    resolve([]);
                    return;
                }

                // Calculate scores
                let results = mockKnowledgeData
                    .map((knowledge) => {
                        let score = 0;
                        const lowerQuery = query.toLowerCase();
                        const lowerTitle = knowledge.title.toLowerCase();
                        const lowerContent = knowledge.content.toLowerCase();

                        if (lowerTitle.includes(lowerQuery)) score += 10;
                        if (lowerContent.includes(lowerQuery)) score += 5;

                        const queryWords = lowerQuery.split(/\s+/);
                        queryWords.forEach((word) => {
                            if (lowerTitle.includes(word)) score += 3;
                            if (lowerContent.includes(word)) score += 1;
                        });

                        return { knowledge, relevanceScore: score };
                    })
                    .filter((result) => result.relevanceScore > 0)
                    .sort((a, b) => b.relevanceScore - a.relevanceScore);

                // Fallback: If results are too few, add random items as "AI suggestions"
                if (results.length < 3) {
                    const existingIds = new Set(results.map(r => r.knowledge.id));
                    const remaining = mockKnowledgeData
                        .filter(k => !existingIds.has(k.id))
                        .map(k => ({ knowledge: k, relevanceScore: 1 })); // Low score for random items

                    // Shuffle remaining items
                    for (let i = remaining.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
                    }

                    results = [...results, ...remaining.slice(0, 3 - results.length)];
                }

                resolve(results.slice(0, 10));

                resolve(results);
            }, 300); // Simulate AI search delay
        });
    }

    async create(input: CreateKnowledgeInput): Promise<Knowledge> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newKnowledge: Knowledge = {
                    id: String(mockKnowledgeData.length + 1),
                    title: input.title,
                    content: input.content,
                    createdAt: new Date(),
                    connections: [],
                };
                mockKnowledgeData.push(newKnowledge);
                resolve(newKnowledge);
            }, 100);
        });
    }

    async addConnection(sourceId: string, targetId: string): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const source = mockKnowledgeData.find((k) => k.id === sourceId);
                const target = mockKnowledgeData.find((k) => k.id === targetId);

                if (source && target) {
                    // Add bidirectional connection
                    // Note: Mock実装のため、型アサーションを使用
                    const sourceConnections = source.connections as string[];
                    const targetConnections = target.connections as string[];
                    if (!sourceConnections.includes(targetId)) {
                        sourceConnections.push(targetId);
                    }
                    if (!targetConnections.includes(sourceId)) {
                        targetConnections.push(sourceId);
                    }
                }
                resolve();
            }, 100);
        });
    }

    async removeConnection(sourceId: string, targetId: string): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                const source = mockKnowledgeData.find((k) => k.id === sourceId);
                const target = mockKnowledgeData.find((k) => k.id === targetId);

                if (source && target) {
                    // Remove bidirectional connection
                    // Note: Mock実装のため、型アサーションを使用
                    const sourceConnections = source.connections as string[];
                    const targetConnections = target.connections as string[];
                    (source as any).connections = sourceConnections.filter((id) => id !== targetId);
                    (target as any).connections = targetConnections.filter((id) => id !== sourceId);
                }
                resolve();
            }, 100);
        });
    }
}

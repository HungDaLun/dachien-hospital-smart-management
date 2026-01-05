'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { Recommendation } from '@/lib/knowledge/push-service';
import Link from 'next/link';

export function RecommendedKnowledge() {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/knowledge/push');
            const data = await res.json();
            if (data.recommendations) {
                setRecommendations(data.recommendations);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/knowledge/push', { method: 'POST' });
            const data = await res.json();
            if (data.recommendations) {
                setRecommendations(data.recommendations);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoading && recommendations.length === 0) {
        return null; // Don't show if nothing relevant
    }

    return (
        <Card className="p-6 mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🔔</span>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Recommended for You</h3>
                        <p className="text-xs text-gray-500">Based on your interests and activity</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRefresh} loading={isLoading}>
                    Refresh
                </Button>
            </div>

            <div className="space-y-3">
                {recommendations.map((rec) => (
                    <div key={rec.file_id} className="bg-white p-3 rounded shadow-sm flex justify-between items-center">
                        <div>
                            <Link href={`/dashboard/knowledge/file/${rec.file_id}`} className="font-medium text-indigo-700 hover:underline">
                                {rec.filename}
                            </Link>
                            <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                <Badge variant="info" size="sm">{rec.reason}</Badge>
                                <span>Score: {Math.round(rec.score * 100)}%</span>
                            </div>
                        </div>
                        <Link
                            href={`/dashboard/knowledge/file/${rec.file_id}`}
                            className="inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 ease-in-out bg-gray-100 text-gray-800 hover:bg-gray-200 px-3 py-1.5 text-sm"
                        >
                            View
                        </Link>
                    </div>
                ))}

                {isLoading && (
                    <div className="text-center text-gray-400 py-2">Analyzing...</div>
                )}
            </div>
        </Card>
    );
}

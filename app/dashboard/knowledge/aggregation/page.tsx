'use client';

import { useState, useEffect } from 'react';
import { Button, Badge } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { AggregationCandidate } from '@/lib/knowledge/aggregation-engine';

export default function AggregationDashboard() {
    const [candidates, setCandidates] = useState<AggregationCandidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingState, setProcessingState] = useState<Record<string, boolean>>({});
    const { toast } = useToast();

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/knowledge/aggregation');
            const data = await res.json();
            if (data.candidates) {
                setCandidates(data.candidates);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load aggregation candidates');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSynthesize = async (candidate: AggregationCandidate) => {
        const key = candidate.concept_name;
        setProcessingState(prev => ({ ...prev, [key]: true }));

        try {
            const res = await fetch('/api/knowledge/aggregation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conceptName: candidate.concept_name,
                    fileIds: candidate.file_ids
                })
            });

            const data = await res.json();

            if (data.success) {
                toast.success(`Generated Unit: ${data.result.conceptName}`);
                // Remove from list
                setCandidates(prev => prev.filter(c => c.concept_name !== key));
            } else {
                toast.error('Synthesis failed');
            }

        } catch (error) {
            console.error(error);
            toast.error('Processing error');
        } finally {
            setProcessingState(prev => ({ ...prev, [key]: false }));
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Knowledge Fragment Aggregation</h1>
                <p className="text-gray-600">
                    Automatically discovered knowledge clusters. Synthesize them into unified Knowledge Units.
                </p>
            </div>

            <div className="flex justify-end mb-4">
                <Button onClick={fetchCandidates} variant="ghost" size="sm" loading={isLoading}>
                    🔄 Refresh Suggestions
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-400">Scanning knowledge base...</div>
            ) : candidates.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <p className="text-gray-500">No aggregation candidates found.</p>
                    <p className="text-sm text-gray-400 mt-2">Try uploading more related documents.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidates.map((candidate) => (
                        <div key={candidate.concept_name} className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col">
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                    <Badge variant="info" className="mb-2">Cluster</Badge>
                                    <span className="text-xs text-gray-400 font-mono">{candidate.file_ids.length} Sources</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{candidate.concept_name}</h3>
                                <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded">
                                    {candidate.reason}
                                </p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <Button
                                    variant="primary"
                                    className="w-full justify-center"
                                    onClick={() => handleSynthesize(candidate)}
                                    loading={processingState[candidate.concept_name]}
                                    disabled={processingState[candidate.concept_name]}
                                >
                                    ✨ Synthesize Unit
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

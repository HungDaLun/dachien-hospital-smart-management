'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Badge } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { AggregationCandidate } from '@/lib/knowledge/aggregation-engine';

export default function AggregationDashboard() {
    const [candidates, setCandidates] = useState<AggregationCandidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingState, setProcessingState] = useState<Record<string, boolean>>({});
    const { toast } = useToast();

    const fetchCandidates = useCallback(async () => {
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
    }, [toast]);

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);



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
        <div className="p-8 max-w-7xl mx-auto text-text-primary">
            <div className="mb-10 border-b border-white/5 pb-8">
                <h1 className="text-4xl font-black text-text-primary mb-2 uppercase tracking-tight">KNOWLEDGE AGGREGATION</h1>
                <p className="text-text-secondary font-medium leading-relaxed">
                    Automatically discovered knowledge clusters. Synthesize them into unified Knowledge Units.
                </p>
            </div>

            <div className="flex justify-end mb-6">
                <Button onClick={fetchCandidates} variant="cta" size="sm" loading={isLoading}>
                    🔄 Refresh Suggestions
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-text-tertiary">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mb-4"></div>
                    <p className="font-bold tracking-widest uppercase text-xs">Scanning knowledge base...</p>
                </div>
            ) : candidates.length === 0 ? (
                <div className="text-center py-24 bg-white/[0.02] rounded-3xl border border-dashed border-white/5">
                    <div className="text-6xl mb-6 opacity-10">🧩</div>
                    <p className="text-text-secondary font-bold text-lg mb-2">No aggregation candidates found.</p>
                    <p className="text-sm text-text-tertiary">Try uploading more related documents to help AI find patterns.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {candidates.map((candidate) => (
                        <div key={candidate.concept_name} className="bg-background-secondary/50 backdrop-blur-sm rounded-2xl border border-white/5 p-6 flex flex-col group hover:border-primary-500/30 transition-all duration-300">
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <Badge variant="secondary" className="font-black uppercase tracking-widest text-[9px]">Cluster</Badge>
                                    <span className="text-[10px] text-text-tertiary font-mono uppercase tracking-widest">{candidate.file_ids.length} Sources</span>
                                </div>
                                <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-primary-400 transition-colors tracking-tight">{candidate.concept_name}</h3>
                                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-6">
                                    <p className="text-sm text-text-secondary leading-relaxed italic">
                                        "{candidate.reason}"
                                    </p>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <Button
                                    variant="cta"
                                    className="w-full justify-center shadow-lg hover:shadow-primary-500/10"
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

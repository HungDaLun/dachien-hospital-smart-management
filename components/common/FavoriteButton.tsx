'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';

interface FavoriteButtonProps {
    resourceType: 'AGENT' | 'FILE';
    resourceId: string;
    initialIsFavorite?: boolean;
    className?: string;
}

export function FavoriteButton({
    resourceType,
    resourceId,
    initialIsFavorite = false,
    className = ''
}: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [loading, setLoading] = useState(false);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault(); // 防止觸發父層連結/點擊
        e.stopPropagation();

        if (loading) return;
        setLoading(true);

        try {
            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resource_type: resourceType, resource_id: resourceId }),
            });

            const json = await res.json();
            if (json.success) {
                setIsFavorite(json.data.is_favorite);
            }
        } catch (error) {
            console.error('Toggle favorite failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            className={`${isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-500'} ${className}`}
            onClick={toggleFavorite}
            disabled={loading}
            title={isFavorite ? '移除最愛' : '加入最愛'}
        >
            {isFavorite ? '★' : '☆'}
        </Button>
    );
}

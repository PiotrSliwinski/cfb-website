'use client';

import { useState, useCallback } from 'react';
import { CollectionConfig, CollectionItem } from '@/types/admin';

export function useCollection(config: CollectionConfig) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load items from API
  const loadItems = useCallback(async (locale: string = 'en') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.endpoints.list}?locale=${locale}`);
      if (!response.ok) throw new Error('Failed to load items');
      const data = await response.json();
      setItems(data || []);
    } catch (err: any) {
      console.error(`Failed to load ${config.name}:`, err);
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [config]);

  // Create item
  const createItem = useCallback(async (formData: FormData) => {
    const response = await fetch(config.endpoints.create, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create item');
    }

    return response.json();
  }, [config]);

  // Update item
  const updateItem = useCallback(async (id: string, formData: FormData) => {
    const response = await fetch(`${config.endpoints.update}/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update item');
    }

    return response.json();
  }, [config]);

  // Delete item
  const deleteItem = useCallback(async (id: string) => {
    if (!confirm(`Are you sure you want to delete this ${config.nameSingular.toLowerCase()}?`)) {
      return { cancelled: true };
    }

    const response = await fetch(`${config.endpoints.delete}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete item');
    }

    await loadItems();
    return response.json();
  }, [config, loadItems]);

  // Toggle publish status
  const togglePublish = useCallback(async (id: string, currentStatus: boolean) => {
    if (!config.endpoints.togglePublish) return;

    // Optimistically update UI
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, is_published: !currentStatus } : item
      )
    );

    try {
      const response = await fetch(config.endpoints.togglePublish, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_published: !currentStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to toggle publish status');
      }

      return response.json();
    } catch (error) {
      // Revert on error
      await loadItems();
      throw error;
    }
  }, [config, loadItems]);

  // Toggle featured status
  const toggleFeatured = useCallback(async (id: string, currentStatus: boolean) => {
    if (!config.endpoints.toggleFeatured) return;

    // Optimistically update UI
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, is_featured: !currentStatus } : item
      )
    );

    try {
      const response = await fetch(config.endpoints.toggleFeatured, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_featured: !currentStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to toggle featured status');
      }

      return response.json();
    } catch (error) {
      // Revert on error
      await loadItems();
      throw error;
    }
  }, [config, loadItems]);

  // Reorder items
  const reorderItems = useCallback(async (updates: Array<{ id: string; display_order: number }>) => {
    if (!config.endpoints.reorder) return;

    // Optimistically update UI
    const reordered = [...items];
    updates.forEach(update => {
      const index = reordered.findIndex(item => item.id === update.id);
      if (index !== -1) {
        reordered[index] = { ...reordered[index], display_order: update.display_order };
      }
    });
    setItems(reordered);

    try {
      const response = await fetch(config.endpoints.reorder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder items');
      }
    } catch (err) {
      console.error('Reorder error:', err);
      // Reload items on error
      await loadItems();
    }
  }, [config, items, loadItems]);

  return {
    items,
    loading,
    error,
    loadItems,
    createItem,
    updateItem,
    deleteItem,
    togglePublish,
    toggleFeatured,
    reorderItems,
  };
}

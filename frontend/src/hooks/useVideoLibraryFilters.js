import { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDebouncedValue from './useDebouncedValue';

const SAVED_FILTERS_KEY = 'videoLibrarySavedFilters';
const PAGE_SIZE = 6;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'size_desc', label: 'Largest first' },
  { value: 'size_asc', label: 'Smallest first' },
  { value: 'duration_desc', label: 'Longest first' },
  { value: 'duration_asc', label: 'Shortest first' },
  { value: 'title_asc', label: 'Title A-Z' },
];

const STATUS_OPTIONS = ['safe', 'flagged', 'processing'];
const CATEGORY_OPTIONS = ['General', 'Training', 'Events', 'Sports', 'Marketing', 'Education'];

const parseCsv = (value) => (value ? value.split(',').filter(Boolean) : []);

const readSavedFilters = () => {
  try {
    return JSON.parse(localStorage.getItem(SAVED_FILTERS_KEY) || '[]');
  } catch {
    return [];
  }
};

const matchesDateRange = (video, range) => {
  if (!range || range === 'any') return true;
  const uploadedAt = new Date(video.date).getTime();
  const now = Date.now();
  const diffDays = (now - uploadedAt) / (1000 * 60 * 60 * 24);
  if (range === '7d') return diffDays <= 7;
  if (range === '30d') return diffDays <= 30;
  if (range === '90d') return diffDays <= 90;
  return true;
};

const matchesSizeRange = (video, range) => {
  if (!range || range === 'any') return true;
  if (range === 'small') return video.size < 100 * 1024 * 1024;
  if (range === 'medium') return video.size >= 100 * 1024 * 1024 && video.size <= 1024 * 1024 * 1024;
  if (range === 'large') return video.size > 1024 * 1024 * 1024;
  return true;
};

const matchesDurationRange = (video, range) => {
  if (!range || range === 'any') return true;
  if (range === 'short') return video.durationSeconds < 5 * 60;
  if (range === 'medium') return video.durationSeconds >= 5 * 60 && video.durationSeconds <= 30 * 60;
  if (range === 'long') return video.durationSeconds > 30 * 60;
  return true;
};

const sortVideos = (videos, sortBy) => {
  const sorted = [...videos];
  if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (sortBy === 'oldest') sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sortBy === 'size_desc') sorted.sort((a, b) => b.size - a.size);
  if (sortBy === 'size_asc') sorted.sort((a, b) => a.size - b.size);
  if (sortBy === 'duration_desc') sorted.sort((a, b) => b.durationSeconds - a.durationSeconds);
  if (sortBy === 'duration_asc') sorted.sort((a, b) => a.durationSeconds - b.durationSeconds);
  if (sortBy === 'title_asc') sorted.sort((a, b) => a.title.localeCompare(b.title));
  return sorted;
};

const useVideoLibraryFilters = (videos) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [savedFilters, setSavedFilters] = useState(readSavedFilters);
  const debouncedSearch = useDebouncedValue(searchInput, 350);

  const filters = useMemo(
    () => ({
      q: searchParams.get('q') || '',
      statuses: parseCsv(searchParams.get('status')),
      dateRange: searchParams.get('date') || 'any',
      sizeRange: searchParams.get('size') || 'any',
      durationRange: searchParams.get('duration') || 'any',
      category: searchParams.get('category') || 'any',
      sortBy: searchParams.get('sort') || 'newest',
      page: Number(searchParams.get('page') || 1),
    }),
    [searchParams],
  );

  const lastSearchRef = useRef(debouncedSearch);

  useEffect(() => {
    if (lastSearchRef.current !== debouncedSearch) {
      lastSearchRef.current = debouncedSearch;
      const nextParams = new URLSearchParams(searchParams);
      if (debouncedSearch) nextParams.set('q', debouncedSearch);
      else nextParams.delete('q');
      nextParams.delete('page');
      setSearchParams(nextParams, { replace: true });
    }
  }, [debouncedSearch, searchParams, setSearchParams]);

  useEffect(() => {
    setSearchInput(filters.q);
  }, [filters.q]);

  const setFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value || value === 'any') nextParams.delete(key);
    else nextParams.set(key, value);
    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  const toggleStatus = (status) => {
    const statusSet = new Set(filters.statuses);
    if (statusSet.has(status)) statusSet.delete(status);
    else statusSet.add(status);
    const nextParams = new URLSearchParams(searchParams);
    const value = [...statusSet].join(',');
    if (value) nextParams.set('status', value);
    else nextParams.delete('status');
    nextParams.delete('page');
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const saveCurrentFilter = (name) => {
    if (!name.trim()) return;
    const next = [{ id: `${Date.now()}`, name: name.trim(), query: searchParams.toString() }, ...savedFilters].slice(0, 8);
    setSavedFilters(next);
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(next));
  };

  const applySavedFilter = (query) => setSearchParams(new URLSearchParams(query));

  const removeSavedFilter = (id) => {
    const next = savedFilters.filter((item) => item.id !== id);
    setSavedFilters(next);
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(next));
  };

  const filteredVideos = useMemo(() => {
    const filtered = videos.filter((video) => {
      const matchesSearch =
        !filters.q ||
        video.title.toLowerCase().includes(filters.q.toLowerCase()) ||
        video.fileName.toLowerCase().includes(filters.q.toLowerCase());
      const matchesStatus = !filters.statuses.length || filters.statuses.includes(video.reviewState);
      const matchesCategory = filters.category === 'any' || video.category === filters.category;
      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesDateRange(video, filters.dateRange) &&
        matchesSizeRange(video, filters.sizeRange) &&
        matchesDurationRange(video, filters.durationRange)
      );
    });

    return sortVideos(filtered, filters.sortBy);
  }, [filters, videos]);

  const totalPages = Math.max(1, Math.ceil(filteredVideos.length / PAGE_SIZE));
  const currentPage = Math.min(filters.page, totalPages);
  const paginatedVideos = filteredVideos.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const setPage = (page) => {
    const nextParams = new URLSearchParams(searchParams);
    if (page <= 1) nextParams.delete('page');
    else nextParams.set('page', String(page));
    setSearchParams(nextParams);
  };

  const activeChips = [
    ...filters.statuses.map((status) => ({
      key: `status:${status}`,
      label: status[0].toUpperCase() + status.slice(1),
      onRemove: () => toggleStatus(status),
    })),
    ...(filters.dateRange !== 'any' ? [{ key: 'date', label: `Date: ${filters.dateRange}`, onRemove: () => setFilter('date', 'any') }] : []),
    ...(filters.sizeRange !== 'any' ? [{ key: 'size', label: `Size: ${filters.sizeRange}`, onRemove: () => setFilter('size', 'any') }] : []),
    ...(filters.durationRange !== 'any' ? [{ key: 'duration', label: `Duration: ${filters.durationRange}`, onRemove: () => setFilter('duration', 'any') }] : []),
    ...(filters.category !== 'any' ? [{ key: 'category', label: filters.category, onRemove: () => setFilter('category', 'any') }] : []),
  ];

  return {
    filters,
    searchInput,
    setSearchInput,
    toggleStatus,
    setFilter,
    clearAllFilters,
    saveCurrentFilter,
    applySavedFilter,
    removeSavedFilter,
    savedFilters,
    filteredVideos,
    paginatedVideos,
    currentPage,
    totalPages,
    setPage,
    activeChips,
    statusOptions: STATUS_OPTIONS,
    categoryOptions: CATEGORY_OPTIONS,
    sortOptions: SORT_OPTIONS,
  };
};

export default useVideoLibraryFilters;

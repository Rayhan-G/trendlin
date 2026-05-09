// types/bookmark.types.ts
export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  domain: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
}

export interface Bookmark {
  id: string;
  is_favorite: boolean;
  read_later: boolean;
  archived: boolean;
  created_at: string;
  posts: Post;
  collections: Collection | null;
}

export interface BookmarksFilters {
  favoritesOnly?: boolean;
  readLaterOnly?: boolean;
  showArchived?: boolean;
  collectionId?: string | null;
  searchQuery?: string;
}
// Validation utilities
export const validateSlug = (slug) => {
  if (!slug) return false;
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length <= 60;
};

export const validateKeywords = (keywords) => {
  return keywords.length <= 10;
};

export const validateTags = (tags) => {
  return tags.length <= 15;
};

export const validatePost = (post) => {
  const errors = {};
  
  if (post.title && post.title.length > 120) {
    errors.title = 'Title must be less than 120 characters';
  }
  
  if (post.slug && !validateSlug(post.slug)) {
    errors.slug = 'Slug must be URL-friendly (lowercase, hyphens only)';
  }
  
  if (post.keywords && post.keywords.length > 10) {
    errors.keywords = 'Maximum 10 keywords allowed';
  }
  
  if (post.tags && post.tags.length > 15) {
    errors.tags = 'Maximum 15 tags allowed';
  }
  
  return errors;
};
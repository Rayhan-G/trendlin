// Types for sources management

/**
 * @typedef {Object} SourceCategory
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {string} icon
 * @property {string} description
 * @property {number} display_order
 * @property {number} is_active
 * @property {string} created_at
 * @property {string} updated_at
 * @property {number} source_count
 */

/**
 * @typedef {Object} SourceState
 * @property {number} id
 * @property {string} name
 * @property {string} code
 * @property {string} abbreviation
 * @property {string} region
 * @property {number} is_active
 * @property {string} created_at
 * @property {string} updated_at
 * @property {number} source_count
 */

/**
 * @typedef {Object} SourceMaster
 * @property {number} id
 * @property {string} name
 * @property {string} url
 * @property {number} category_id
 * @property {string} description
 * @property {string} source_type
 * @property {string} logo_url
 * @property {number} is_active
 * @property {number} is_featured
 * @property {number} trust_score
 * @property {number} usage_count
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} category_name
 * @property {string} category_icon
 * @property {string} source_type_actual
 */

/**
 * @typedef {Object} SourceState
 * @property {number} id
 * @property {string} name
 * @property {string} url
 * @property {number} category_id
 * @property {string} description
 * @property {string} source_type
 * @property {string} logo_url
 * @property {number} is_active
 * @property {number} is_featured
 * @property {number} trust_score
 * @property {number} usage_count
 * @property {string} address
 * @property {string} phone
 * @property {string} email
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} category_name
 * @property {string} category_icon
 * @property {number} state_id
 * @property {string} state_name
 * @property {string} state_code
 * @property {string} source_type_actual
 */
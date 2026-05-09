// src/components/frontend/NewsletterSubscribe/components/CategorySelector.js
import styles from '../styles/newsletter.module.css'

export default function CategorySelector({ 
  categories, 
  selectedCategories, 
  onToggle, 
  onSelectAll,
  disabled,
  deliveryDay,
  maxPostsPerWeek,
  isCompact = false
}) {
  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll()
    } else {
      if (selectedCategories.length === categories.length) {
        categories.forEach(cat => onToggle(cat.id))
      } else {
        categories.forEach(cat => {
          if (!selectedCategories.includes(cat.id)) {
            onToggle(cat.id)
          }
        })
      }
    }
  }

  return (
    <div className={`${styles.categoriesSection} ${isCompact ? styles.compact : ''}`}>
      <div className={styles.categoriesHeader}>
        <span>Select topics</span>
        <button type="button" onClick={handleSelectAll} className={styles.selectAllBtn}>
          {selectedCategories.length === categories.length ? 'Deselect all' : 'Select all'}
        </button>
      </div>
      
      <div className={styles.categoriesGrid}>
        {categories.map((category) => (
          <label 
            key={category.id} 
            className={`${styles.categoryOption} ${selectedCategories.includes(category.id) ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
          >
            <input 
              type="checkbox" 
              checked={selectedCategories.includes(category.id)} 
              onChange={() => onToggle(category.id)} 
              disabled={disabled}
            />
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </label>
        ))}
      </div>
      
      {selectedCategories.length > 0 && (
        <div className={styles.postsPreview}>
          📬 {selectedCategories.length} post{selectedCategories.length !== 1 ? 's' : ''} every {deliveryDay}
        </div>
      )}
    </div>
  )
}
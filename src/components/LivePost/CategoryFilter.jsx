// components/LivePost/CategoryFilter.jsx
import { useState } from 'react';

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const allCategories = [{ id: 'all', name: 'All', icon: '📱' }, ...categories];
    
    return (
        <div className="category-filter">
            <div className="filter-header">
                <button 
                    className="mobile-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <span>Filter by category</span>
                    <span>{isMobileMenuOpen ? '▲' : '▼'}</span>
                </button>
            </div>
            
            <div className={`categories-wrapper ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="categories-list">
                    {allCategories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => {
                                onSelectCategory(category.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`category-chip ${selectedCategory === category.id ? 'active' : ''}`}
                        >
                            <span className="category-icon">{category.icon || '📝'}</span>
                            <span className="category-name">{category.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            <style jsx>{`
                .category-filter {
                    background: var(--card-bg);
                    border-bottom: 1px solid var(--border-color);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                
                .filter-header {
                    padding: 0.75rem 1rem;
                }
                
                .mobile-toggle {
                    display: none;
                    width: 100%;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem;
                    background: var(--hover-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text-primary);
                    cursor: pointer;
                }
                
                .categories-wrapper {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0.5rem 1rem;
                }
                
                .categories-list {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                .category-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: var(--hover-bg);
                    border: 1px solid transparent;
                    border-radius: 40px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .category-chip:hover {
                    background: var(--border-color);
                    transform: translateY(-2px);
                }
                
                .category-chip.active {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-color: transparent;
                }
                
                @media (max-width: 768px) {
                    .mobile-toggle {
                        display: flex;
                    }
                    
                    .categories-wrapper {
                        max-height: 0;
                        overflow: hidden;
                        transition: max-height 0.3s ease;
                        padding: 0 1rem;
                    }
                    
                    .categories-wrapper.open {
                        max-height: 500px;
                        padding: 1rem;
                    }
                    
                    .categories-list {
                        justify-content: flex-start;
                    }
                }
            `}</style>
        </div>
    );
}
import { useState } from 'react'
import { CROP_CATEGORIES, getCropMetadata, getCropColor } from '../config'
import './CropCategorySelector.css'

export default function CropCategorySelector({
  selectedCrops,
  quantities,
  onCropSelect,
  onQuantityChange
}) {
  const [expandedCategories, setExpandedCategories] = useState({
    hortalizas: true,
    extensivo: false,
    aromaticas: false,
    tuberculos: false,
  })

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  const handleCropClick = (cropId) => {
    onCropSelect(cropId)
  }

  return (
    <div className="crop-category-selector">
      {Object.entries(CROP_CATEGORIES).map(([categoryId, category]) => (
        <div key={categoryId} className="crop-category">
          <button
            className="crop-category-header"
            onClick={() => toggleCategory(categoryId)}
          >
            <span className="crop-category-icon">{category.icon}</span>
            <span className="crop-category-name">{category.name}</span>
            <span className="crop-category-toggle">
              {expandedCategories[categoryId] ? '▼' : '▶'}
            </span>
          </button>

          {expandedCategories[categoryId] && (
            <div className="crop-category-content">
              <div className="crop-grid">
                {category.crops.map(cropId => {
                  const cropMeta = getCropMetadata(cropId)
                  const quantity = quantities[cropId] || 0
                  const isSelected = selectedCrops.includes(cropId)
                  const cropColor = getCropColor(cropId)

                  return (
                    <button
                      key={cropId}
                      className={`crop-button ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleCropClick(cropId)}
                      style={{
                        backgroundColor: isSelected ? cropColor : 'white',
                        borderColor: cropColor,
                        color: isSelected ? 'white' : '#333'
                      }}
                      title={cropMeta.name}
                    >
                      <span className="crop-emoji">{cropMeta.emoji}</span>
                      <span className="crop-name">{cropMeta.name}</span>
                      {quantity > 0 && (
                        <span className="crop-quantity">{quantity}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

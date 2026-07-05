import { useState, useEffect } from 'react'
import { getCropMetadata } from '../utils/cropCategories'
import { getRecommendedSpacing } from '../utils/cropSpacing'
import './CropQuantityModal.css'

export default function CropQuantityModal({
  isOpen,
  cropId,
  currentQuantity,
  onConfirm,
  onCancel
}) {
  const [quantity, setQuantity] = useState(0)

  useEffect(() => {
    if (isOpen && currentQuantity !== undefined) {
      setQuantity(currentQuantity)
    }
  }, [isOpen, currentQuantity])

  const handleConfirm = () => {
    const finalQuantity = Math.max(0, parseInt(quantity) || 0)
    onConfirm(finalQuantity)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleConfirm()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  if (!isOpen) return null

  const cropMeta = getCropMetadata(cropId)
  const marcoRecomendado = getRecommendedSpacing(cropId)

  return (
    <div className="crop-modal-overlay" onClick={handleBackdropClick}>
      <div className="crop-modal">
        <div className="crop-modal-header">
          <span className="crop-modal-emoji">{cropMeta.emoji}</span>
          <h3>{cropMeta.name}</h3>
        </div>

        {marcoRecomendado && (
          <p style={{ fontSize: '12px', color: '#777', margin: '0 0 12px', textAlign: 'center' }}>
            Marco recomendado: {marcoRecomendado.horizontal}×{marcoRecomendado.vertical}cm
          </p>
        )}

        <div className="crop-modal-body">
          <label htmlFor="quantity-input">Cantidad de plantas:</label>
          <input
            id="quantity-input"
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="0"
          />
        </div>

        <div className="crop-modal-footer">
          <button className="crop-modal-btn cancel-btn" onClick={onCancel}>
            Cancelar
          </button>
          <button className="crop-modal-btn confirm-btn" onClick={handleConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

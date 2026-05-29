import './HamburgerMenu.css'

export default function HamburgerMenu({ isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`hamburger-menu ${isOpen ? 'open' : ''}`}
      title={isOpen ? 'Cerrar panel de control' : 'Abrir panel de control'}
      aria-label={isOpen ? 'Cerrar panel' : 'Abrir panel'}
    >
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
    </button>
  )
}

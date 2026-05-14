import { Maximize2, Minimize2 } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

type PropertyImageGalleryProps = {
  images: string[]
  title: string
  isOpen: boolean
  initialIndex?: number
  onClose: () => void
}

type DocWithWebkit = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void>
}

type ElWithWebkit = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>
}

function getFullscreenElement(): Element | null {
  const d = document as DocWithWebkit
  return document.fullscreenElement ?? d.webkitFullscreenElement ?? null
}

async function exitFullscreen(): Promise<void> {
  const d = document as DocWithWebkit
  if (document.fullscreenElement && document.exitFullscreen) {
    await document.exitFullscreen()
  } else if (d.webkitFullscreenElement && d.webkitExitFullscreen) {
    await d.webkitExitFullscreen()
  }
}

async function enterFullscreen(el: HTMLElement): Promise<void> {
  const node = el as ElWithWebkit
  if (typeof node.requestFullscreen === 'function') {
    await node.requestFullscreen()
  } else if (typeof node.webkitRequestFullscreen === 'function') {
    await node.webkitRequestFullscreen()
  }
}

export function PropertyImageGallery({
  images,
  title,
  isOpen,
  initialIndex = 0,
  onClose,
}: PropertyImageGalleryProps) {
  const labelId = useId()
  const [index, setIndex] = useState(initialIndex)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const count = images.length
  const safeIndex = count > 0 ? Math.min(Math.max(0, index), count - 1) : 0
  const current = images[safeIndex] ?? ''

  const syncFullscreen = useCallback(() => {
    const el = panelRef.current
    setIsFullscreen(!!el && getFullscreenElement() === el)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setIndex(Math.min(Math.max(0, initialIndex), Math.max(0, count - 1)))
    }
  }, [isOpen, initialIndex, count])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    closeBtnRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    document.addEventListener('fullscreenchange', syncFullscreen)
    document.addEventListener('webkitfullscreenchange', syncFullscreen as EventListener)
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen)
      document.removeEventListener('webkitfullscreenchange', syncFullscreen as EventListener)
    }
  }, [syncFullscreen])

  useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false)
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      const el = panelRef.current
      if (el && getFullscreenElement() === el) {
        void exitFullscreen()
      }
    }
  }, [])

  const go = useCallback(
    (delta: number) => {
      if (count < 1) return
      setIndex((i) => (i + delta + count) % count)
    },
    [count],
  )

  const handleClose = useCallback(() => {
    const el = panelRef.current
    if (el && getFullscreenElement() === el) {
      void exitFullscreen().finally(() => onClose())
      return
    }
    onClose()
  }, [onClose])

  const toggleFullscreen = useCallback(async () => {
    const el = panelRef.current
    if (!el) return
    try {
      if (getFullscreenElement() === el) {
        await exitFullscreen()
      } else {
        await enterFullscreen(el)
      }
    } catch {
      /* unsupported or denied */
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const el = panelRef.current
        if (el && getFullscreenElement() === el) {
          e.preventDefault()
          void exitFullscreen()
          return
        }
        e.preventDefault()
        handleClose()
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(-1)
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        go(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, handleClose, go])

  if (!isOpen || count === 0) return null

  return (
    <div
      className="gallery-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
    >
      <button type="button" className="gallery-modal__backdrop" aria-label="Close gallery" onClick={handleClose} />

      <div ref={panelRef} className="gallery-modal__panel">
        <header className="gallery-modal__header">
          <p id={labelId} className="gallery-modal__title">
            {title}
          </p>
          <p className="gallery-modal__counter" aria-live="polite">
            {safeIndex + 1} / {count}
          </p>
          <div className="gallery-modal__actions">
            <button
              type="button"
              className="gallery-modal__icon-btn"
              onClick={() => void toggleFullscreen()}
              aria-pressed={isFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={18} strokeWidth={2} /> : <Maximize2 size={18} strokeWidth={2} />}
            </button>
            <button ref={closeBtnRef} type="button" className="gallery-modal__close" onClick={handleClose}>
              Close
              <span className="gallery-modal__close-x" aria-hidden>
                ×
              </span>
            </button>
          </div>
        </header>

        <div className="gallery-modal__stage">
          <button
            type="button"
            className="gallery-modal__nav gallery-modal__nav--prev"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            disabled={count < 2}
          >
            ‹
          </button>
          <div className="gallery-modal__frame">
            <img src={current} alt="" className="gallery-modal__img" />
          </div>
          <button
            type="button"
            className="gallery-modal__nav gallery-modal__nav--next"
            onClick={() => go(1)}
            aria-label="Next photo"
            disabled={count < 2}
          >
            ›
          </button>
        </div>

        <div className="gallery-modal__thumbs" role="tablist" aria-label="Gallery thumbnails">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === safeIndex}
              className={`gallery-modal__thumb ${i === safeIndex ? 'gallery-modal__thumb--active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}`}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

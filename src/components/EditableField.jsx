import { useEffect, useRef } from 'react'

export default function EditableField({ value, onInput, className, placeholder }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) ref.current.textContent = value ?? ''
  }, []) // set on mount only — leave DOM alone while user types

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={className}
      onInput={e => onInput(e.currentTarget.textContent)}
    />
  )
}

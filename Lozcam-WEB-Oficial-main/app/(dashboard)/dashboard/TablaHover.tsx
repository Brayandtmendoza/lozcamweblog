"use client"

import { useState } from "react"

interface FilaProps {
  children: React.ReactNode
  onClick?: () => void
}

export function FilaTabla({ children, onClick }: FilaProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? "rgba(245, 158, 11, 0.08)" : "transparent",
        cursor: onClick ? "pointer" : "default",
        transition: "background-color 0.15s ease",
      }}
    >
      {children}
    </tr>
  )
}


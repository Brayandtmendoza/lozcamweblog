"use client"

import { useState } from "react"

export function FilaTabla({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "var(--table-row-hover)" : "transparent",
        cursor: onClick ? "pointer" : "default",
        transition: "background-color 0.15s ease",
      }}
    >
      {children}
    </tr>
  )
}


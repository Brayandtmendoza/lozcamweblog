"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"


interface FilaTablaProps {
  children: React.ReactNode
  href?: string
  className?: string
}

export function FilaTabla({ children, href, className = "" }: FilaTablaProps) {
  const [hovered, setHovered] = useState(false)
  const router = useRouter()

  return (
    <tr
      onClick={href ? () => router.push(href) : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
      style={{
        backgroundColor: hovered ? "rgba(245, 158, 11, 0.08)" : "transparent",
        cursor: href ? "pointer" : "default",
        transition: "background-color 0.15s ease",
        borderTop: "1px solid var(--table-border)",
      }}
    >
      {children}
    </tr>
  )
}




"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // パスに基づいてアクティブなアイテムを設定
    if (pathname) {
      const currentItem = items.find(item => pathname === item.url || pathname.startsWith(item.url + '/'))
      setActiveTab(currentItem?.name || items[0].name)
    } else {
      setActiveTab(items[0].name)
    }
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [pathname, items])

  return (
    <div
      className={cn(
        "fixed bottom-0 sm:relative sm:bottom-auto sm:left-auto sm:transform-none z-50 mb-6 sm:mb-0 sm:pt-0",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-white border border-gray-200 py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-gray-700 hover:text-orange-500",
                isActive && "bg-orange-100 text-orange-500",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-orange-50 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-t-full">
                    <div className="absolute w-12 h-6 bg-orange-200/40 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-orange-200/40 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-orange-200/40 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
} 
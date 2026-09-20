"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "../../lib/utils"

export interface NavItem {
  name: string
  url: string
  icon: LucideIcon
  highlight?: boolean
}

export interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const location = useLocation()
  const currentItem = items.find((item) =>
    item.url === location.pathname || (item.url !== '/' && location.pathname.startsWith(item.url))
  )
  const [activeTab, setActiveTab] = useState(currentItem ? currentItem.name : items[0]?.name)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (currentItem) {
      setActiveTab(currentItem.name)
    }
  }, [location.pathname, currentItem])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "flex items-center",
        className,
      )}
    >
      <div className="flex items-center gap-1 sm:gap-2 bg-stone-100/95 dark:bg-stone-900/95 border border-stone-300 dark:border-stone-700 backdrop-blur-lg py-1 px-1.5 rounded-full shadow-sm">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              to={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 rounded-full transition-colors flex items-center gap-2",
                "text-stone-700 hover:text-stone-950 dark:text-stone-300 dark:hover:text-white",
                isActive && "text-indigo-700 dark:text-cyan-300 font-bold",
                item.highlight && !isActive && "text-emerald-700 dark:text-emerald-400 font-semibold"
              )}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              <span className="hidden md:inline">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-indigo-500/10 dark:bg-cyan-500/20 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 dark:bg-cyan-400 rounded-t-full">
                    <div className="absolute w-12 h-6 bg-indigo-500/30 dark:bg-cyan-400/30 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-indigo-500/30 dark:bg-cyan-400/30 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-indigo-500/30 dark:bg-cyan-400/30 rounded-full blur-sm top-0 left-2" />
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

export { NavBar as TubelightNavBar }

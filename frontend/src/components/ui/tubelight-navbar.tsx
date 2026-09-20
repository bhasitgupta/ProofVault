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
  
  // Directly derive active tab from URL pathname for instant 1-click animation without state lag
  const pathname = location.pathname
  const currentItem = items.find((item) => {
    if (item.url === '/') return pathname === '/'
    return pathname === item.url || pathname.startsWith(item.url + '/')
  })
  const activeTab = currentItem ? currentItem.name : items[0]?.name

  return (
    <div
      className={cn(
        "flex items-center shrink-0 whitespace-nowrap",
        className,
      )}
    >
      <div className="flex items-center gap-1 sm:gap-2 bg-stone-200/80 border border-stone-300/90 backdrop-blur-lg py-1 px-1.5 rounded-full shadow-sm">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              to={item.url}
              className={cn(
                "relative cursor-pointer text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-1.5 rounded-full transition-colors flex items-center gap-2 whitespace-nowrap select-none",
                "text-stone-800 hover:text-stone-950",
                isActive && "text-indigo-950 font-extrabold",
                item.highlight && !isActive && "text-emerald-800 font-bold"
              )}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-indigo-700" : "text-stone-700"} />
              <span className="hidden md:inline whitespace-nowrap">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-white/95 rounded-full shadow-xs border border-stone-200/90 -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-indigo-600 rounded-t-full">
                    <div className="absolute w-12 h-6 bg-indigo-500/35 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-indigo-500/35 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-indigo-500/35 rounded-full blur-sm top-0 left-2" />
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

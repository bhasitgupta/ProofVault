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
      <div className="flex items-center gap-1 sm:gap-1.5 bg-[#FAF6EF]/90 border border-[#D8CFBC] backdrop-blur-lg py-1 px-1.5 rounded-full shadow-xs">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              to={item.url}
              className={cn(
                "relative cursor-pointer text-xs lg:text-sm font-semibold px-2.5 sm:px-3 lg:px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 sm:gap-2 whitespace-nowrap select-none",
                "text-[#565449] hover:text-[#11120D]",
                isActive && "text-[#11120D] font-bold",
                item.highlight && !isActive && "text-emerald-800 font-bold"
              )}
            >
              <Icon size={15} strokeWidth={isActive ? 2.5 : 1.75} className={isActive ? "text-[#11120D]" : "text-[#565449]"} />
              <span className="hidden md:inline whitespace-nowrap">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-white rounded-full shadow-xs border border-[#D8CFBC] -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-0.5 bg-[#11120D] rounded-t-full">
                    <div className="absolute w-8 h-3 bg-[#565449]/25 rounded-full blur-xs -top-1" />
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

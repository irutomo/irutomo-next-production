"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // パスに基づいてアクティブなアイテムを設定
  useEffect(() => {
    const currentIndex = items.findIndex(item => pathname === item.url || pathname.startsWith(item.url + '/'));
    setActiveIndex(currentIndex >= 0 ? currentIndex : null);
  }, [pathname, items]);

  // チューブライトスタイルのナビゲーション
  return (
    <div className={cn("relative mb-6 pt-6 transition-transform", className)}>
      <div className="flex justify-center">
        <nav className="flex items-center rounded-full border border-gray-200 overflow-hidden">
          {items.map((item, index) => {
            const isActive = activeIndex === index;
            const isHovered = hoveredIndex === index;
            
            return (
              <Link
                href={item.url}
                key={item.url}
                className={cn(
                  "relative px-6 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-500 text-white"
                    : "text-gray-700 hover:bg-gray-50"
                )}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <span className="relative z-10 flex items-center gap-1">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.name}
                </span>
                
                {/* チューブライトエフェクト - アクティブまたはホバー時 */}
                {(isActive || isHovered) && (
                  <span
                    className={cn(
                      "absolute inset-0 z-0 bg-primary-500 transition-all duration-300",
                      isActive ? "opacity-100" : "opacity-80"
                    )}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
} 
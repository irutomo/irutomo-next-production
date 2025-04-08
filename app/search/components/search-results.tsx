'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Restaurant {
  id: string
  name: string
  description: string
  image_url: string
  location: string
  average_price: number
  restaurant_categories: { category_id: string }[]
}

interface Category {
  id: string
  name: string
}

interface SearchResultsProps {
  restaurants: Restaurant[]
  categories: Category[]
  totalCount: number
  currentPage: number
  pageSize: number
  query: string
  location: string
  category: string
  minPrice: string
  maxPrice: string
}

export default function SearchResults({
  restaurants,
  categories,
  totalCount,
  currentPage,
  pageSize,
  query,
  location,
  category,
  minPrice,
  maxPrice
}: SearchResultsProps) {
  const router = useRouter()
  const [filters, setFilters] = useState({
    query,
    location,
    category,
    minPrice,
    maxPrice
  })

  const totalPages = Math.ceil(totalCount / pageSize)

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })
    
    params.set('page', '1') // フィルター変更時は1ページ目に戻す
    router.push(`/search?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set('page', page.toString())
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* フィルターサイドバー */}
      <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">絞り込み検索</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">キーワード</label>
            <input
              type="text"
              name="query"
              value={filters.query}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="店名や料理名"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">エリア</label>
            <input
              type="text"
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="東京、大阪など"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">カテゴリー</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">すべて</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">価格帯</label>
            <div className="flex gap-2">
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="w-1/2 px-3 py-2 border rounded-md"
                placeholder="最低"
              />
              <span className="flex items-center">〜</span>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-1/2 px-3 py-2 border rounded-md"
                placeholder="最高"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            検索する
          </button>
        </form>
      </div>
      
      {/* 検索結果 */}
      <div className="lg:col-span-3">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm">
            {totalCount}件中 {(currentPage - 1) * pageSize + 1}〜
            {Math.min(currentPage * pageSize, totalCount)}件を表示
          </p>
        </div>
        
        {restaurants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">検索条件に一致するレストランが見つかりませんでした。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.id}`}
                className="block bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={restaurant.image_url || '/images/restaurant-placeholder.jpg'}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{restaurant.location}</p>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                    {restaurant.description}
                  </p>
                  <p className="text-blue-600 font-medium">
                    平均 {restaurant.average_price.toLocaleString()}円
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav>
              <ul className="flex gap-1">
                {currentPage > 1 && (
                  <li>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-3 py-1 border rounded hover:bg-gray-100"
                    >
                      前へ
                    </button>
                  </li>
                )}
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1
                  
                  // 現在のページから2ページ前から2ページ後までを表示
                  let pageToShow
                  if (totalPages <= 5) {
                    pageToShow = pageNum
                  } else if (currentPage <= 3) {
                    pageToShow = pageNum
                  } else if (currentPage >= totalPages - 2) {
                    pageToShow = totalPages - 4 + i
                  } else {
                    pageToShow = currentPage - 2 + i
                  }
                  
                  return (
                    <li key={pageToShow}>
                      <button
                        onClick={() => handlePageChange(pageToShow)}
                        className={`px-3 py-1 border rounded ${
                          currentPage === pageToShow
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {pageToShow}
                      </button>
                    </li>
                  )
                })}
                
                {currentPage < totalPages && (
                  <li>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-3 py-1 border rounded hover:bg-gray-100"
                    >
                      次へ
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
} 
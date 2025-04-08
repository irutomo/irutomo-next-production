'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { submitReview } from '../actions'

interface Restaurant {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

interface ReviewFormProps {
  restaurantId?: string
  restaurant?: Restaurant | null
  cuisines: Category[]
}

export default function ReviewForm({ restaurantId, restaurant, cuisines }: ReviewFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([])
  const photoInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating)
  }

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      if (selectedTags.length < 3) {
        setSelectedTags([...selectedTags, tag])
      }
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles: File[] = []
    const newPreviewUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('画像サイズは5MB以下にしてください')
        continue
      }

      if (!file.type.startsWith('image/')) {
        setErrorMessage('画像ファイルのみアップロードできます')
        continue
      }

      newFiles.push(file)
      newPreviewUrls.push(URL.createObjectURL(file))
    }

    setPhotoFiles([...photoFiles, ...newFiles])
    setPhotoPreviewUrls([...photoPreviewUrls, ...newPreviewUrls])
  }

  const removePhoto = (index: number) => {
    const newFiles = [...photoFiles]
    const newPreviewUrls = [...photoPreviewUrls]
    
    // プレビューのURLを解放
    URL.revokeObjectURL(newPreviewUrls[index])
    
    newFiles.splice(index, 1)
    newPreviewUrls.splice(index, 1)
    
    setPhotoFiles(newFiles)
    setPhotoPreviewUrls(newPreviewUrls)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const formData = new FormData(e.currentTarget)
      
      // レストランIDの追加
      if (restaurantId) {
        formData.append('restaurantId', restaurantId)
      }
      
      // 評価の追加
      if (selectedRating) {
        formData.set('rating', selectedRating.toString())
      }
      
      // タグの追加
      formData.delete('tags')
      selectedTags.forEach(tag => {
        formData.append('tags', tag)
      })
      
      // 写真の追加
      photoFiles.forEach(file => {
        formData.append('photos', file)
      })

      const result = await submitReview(formData)

      if (result.success) {
        setSuccessMessage(result.message || 'レビューが投稿されました！')
        
        // フォームをリセット
        formRef.current?.reset()
        setSelectedRating(null)
        setSelectedTags([])
        setPhotoFiles([])
        setPhotoPreviewUrls([])
        
        // 3秒後にレビュー一覧ページに遷移
        setTimeout(() => {
          if (restaurantId) {
            router.push(`/restaurants/${restaurantId}`)
          } else {
            router.push('/reviews')
          }
        }, 3000)
      } else {
        setErrorMessage(result.error || 'エラーが発生しました。もう一度お試しください。')
      }
    } catch (error) {
      console.error('レビュー投稿エラー:', error)
      setErrorMessage('予期しないエラーが発生しました。しばらく経ってからお試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
      {/* エラーメッセージ */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errorMessage}
        </div>
      )}
      
      {/* 成功メッセージ */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}
      
      {/* ステップ1: 訪問したレストラン */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-primary-700">ステップ1: 訪問したレストラン</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="restaurant" className="block text-sm font-medium text-gray-700 mb-1">レストラン名 *</label>
            <input 
              type="text" 
              id="restaurant" 
              name="restaurant"
              defaultValue={restaurant?.name || ''}
              className="w-full rounded-lg border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="訪問したレストラン名を入力してください"
              required
              disabled={!!restaurant}
            />
          </div>
          
          <div>
            <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700 mb-1">訪問日 *</label>
            <input 
              type="date" 
              id="visitDate" 
              name="visitDate"
              className="w-full rounded-lg border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-1">料理の種類</label>
            <select 
              id="cuisine" 
              name="cuisine"
              className="w-full rounded-lg border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">選択してください</option>
              {cuisines.map((cuisine) => (
                <option key={cuisine.id} value={cuisine.id}>
                  {cuisine.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* ステップ2: 評価 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-primary-700">ステップ2: 評価</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">総合評価 *</label>
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label 
                  key={rating} 
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleRatingChange(rating)}
                >
                  <input 
                    type="radio" 
                    name="rating" 
                    value={rating} 
                    className="sr-only" 
                    required
                    checked={selectedRating === rating}
                    onChange={() => {}}
                  />
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 ${
                    selectedRating === rating 
                      ? 'bg-primary-500 text-white border-primary-500' 
                      : 'border-gray-200 hover:border-primary-500'
                  }`}>
                    {rating}
                  </div>
                  <span className="mt-1 text-sm text-gray-500">
                    {rating === 1 && '不満'}
                    {rating === 2 && 'やや不満'}
                    {rating === 3 && '普通'}
                    {rating === 4 && '満足'}
                    {rating === 5 && '大満足'}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-1">レビュー内容 *</label>
            <textarea 
              id="review" 
              name="review"
              rows={6} 
              className="w-full rounded-lg border border-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="料理の味、サービス、雰囲気など、あなたの体験を共有してください。"
              required
              minLength={50}
              maxLength={1000}
            ></textarea>
            <p className="text-sm text-gray-500 mt-1">最低50文字、最大1000文字</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">タグ（最大3つ）</label>
            <div className="flex flex-wrap gap-2">
              {['コスパが良い', '雰囲気が良い', 'サービスが良い', '料理が美味しい', '接待におすすめ', 'デートにおすすめ', '家族向け', '個人経営', 'リピート決定'].map((tag) => (
                <label 
                  key={tag} 
                  className={`flex items-center space-x-2 border rounded-full px-3 py-1.5 cursor-pointer ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-50 border-primary-300'
                      : 'border-gray-200 hover:bg-primary-50'
                  }`}
                  onClick={() => handleTagToggle(tag)}
                >
                  <input 
                    type="checkbox" 
                    value={tag} 
                    className="h-4 w-4 text-primary-500 focus:ring-primary-500"
                    checked={selectedTags.includes(tag)}
                    onChange={() => {}}
                  />
                  <span className="text-sm">{tag}</span>
                </label>
              ))}
            </div>
            {selectedTags.length === 3 && (
              <p className="text-sm text-amber-600 mt-2">タグは最大3つまで選択できます</p>
            )}
          </div>
        </div>
      </div>
      
      {/* ステップ3: 写真 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-primary-700">ステップ3: 写真を追加（任意）</h2>
        
        <div className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
            onClick={() => photoInputRef.current?.click()}
          >
            <input 
              ref={photoInputRef}
              type="file" 
              className="hidden" 
              accept="image/*" 
              multiple 
              onChange={handlePhotoChange}
            />
            <div className="flex flex-col items-center cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-primary-600 font-medium">クリックして写真をアップロード</p>
              <p className="text-sm text-gray-500 mt-1">または、ここにドラッグ&ドロップしてください</p>
              <p className="text-xs text-gray-500 mt-3">JPG、PNGファイル、最大5MBまで</p>
            </div>
          </div>
          
          {photoPreviewUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
              {photoPreviewUrls.map((url, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden">
                  <div className="aspect-w-4 aspect-h-3 relative h-36">
                    <Image
                      src={url}
                      alt={`プレビュー画像 ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 利用規約 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input 
              id="terms" 
              name="terms"
              type="checkbox" 
              className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300 rounded"
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="font-medium text-gray-700">レビュー利用規約に同意します *</label>
            <p className="text-gray-500">
              投稿したレビューはIRUTOMOサービス内で公開され、マーケティング目的で使用される場合があります。
              <Link href="/terms" className="text-primary-600 hover:text-primary-700 ml-1">
                規約の全文を読む
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* 送信ボタン */}
      <div className="flex justify-center">
        <button 
          type="submit" 
          className={`px-8 py-3 rounded-md transition-colors font-medium shadow-md hover:shadow-lg ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-primary-500 hover:bg-primary-600 text-white'
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? '送信中...' : 'レビューを投稿する'}
        </button>
      </div>
    </form>
  )
} 
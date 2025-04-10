'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

type Reservation = {
  id: string;
  reservation_date: string;
  reservation_time: string;
  guest_name: string;
  guest_email: string;
  number_of_people: number;
  status: string;
  payment_status: string;
  payment_amount: string;
  created_at: string;
  restaurant_id: string;
  restaurants?: {
    id: string;
    name: string;
  };
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<{ id: string; name: string }[]>([]);
  
  // フィルター状態
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [restaurantFilter, setRestaurantFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // ページネーション
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  
  const supabase = createClientComponentClient();

  // レストラン一覧を取得
  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('レストラン取得エラー:', error);
        return;
      }
      
      setRestaurants(data || []);
    };
    
    fetchRestaurants();
  }, [supabase]);

  // 予約データを取得
  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      
      let query = supabase
        .from('reservations')
        .select(`
          *,
          restaurants (
            id,
            name
          )
        `);
      
      // 各種フィルター適用
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (restaurantFilter !== 'all') {
        query = query.eq('restaurant_id', restaurantFilter);
      }
      
      if (dateFilter) {
        query = query.eq('reservation_date', dateFilter);
      }
      
      if (searchTerm) {
        query = query.or(`guest_name.ilike.%${searchTerm}%,guest_email.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);
      
      if (error) {
        console.error('Error fetching reservations:', error);
        setLoading(false);
        return;
      }
      
      setReservations(data as Reservation[]);
      setLoading(false);
    };
    
    fetchReservations();
  }, [supabase, statusFilter, restaurantFilter, dateFilter, searchTerm, currentPage]);

  // 予約ステータスを更新する関数
  const updateReservationStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // 更新成功後、リストを更新
      setReservations(prevReservations => 
        prevReservations.map(reservation => 
          reservation.id === id 
            ? { ...reservation, status: newStatus } 
            : reservation
        )
      );
    } catch (error) {
      console.error('予約ステータス更新エラー:', error);
    }
  };

  // ステータスに応じたバッジのスタイルを返す
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ステータスの日本語表示
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '未処理';
      case 'confirmed': return '確認済';
      case 'completed': return '完了';
      case 'cancelled': return 'キャンセル';
      case 'rejected': return '拒否';
      default: return status;
    }
  };

  // フィルターをリセット
  const resetFilters = () => {
    setStatusFilter('all');
    setRestaurantFilter('all');
    setDateFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // 日付を日本語フォーマットで表示
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'yyyy年MM月dd日', { locale: ja });
    } catch (e) {
      return dateString;
    }
  };

  // formatDateWithTimeを修正
  const formatDateWithTime = (dateStr: string, timeStr: string): string => {
    if (!dateStr) return '日時未設定';
    const date = parseISO(dateStr);
    return format(date, 'yyyy年MM月dd日', { locale: ja }) + ' ' + timeStr;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">予約管理</h2>
        <button
          onClick={resetFilters}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
        >
          フィルターをリセット
        </button>
      </div>
      
      {/* フィルターコントロール */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ステータス
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            >
              <option value="all">すべて</option>
              <option value="pending">未処理</option>
              <option value="confirmed">確認済</option>
              <option value="completed">完了</option>
              <option value="cancelled">キャンセル</option>
              <option value="rejected">拒否</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              レストラン
            </label>
            <select
              value={restaurantFilter}
              onChange={(e) => {
                setRestaurantFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            >
              <option value="all">すべて</option>
              {restaurants.map(restaurant => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              予約日
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              検索（名前/メール）
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="名前またはメールアドレスで検索"
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>
        </div>
      </div>
      
      {/* 予約リスト */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>予約が見つかりませんでした</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    予約ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日時
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    レストラン
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ゲスト
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    人数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateWithTime(reservation.reservation_date, reservation.reservation_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.restaurants?.name || '不明'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{reservation.guest_name}</div>
                      <div className="text-sm text-gray-500">{reservation.guest_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.number_of_people}名
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={reservation.status}
                        onChange={(e) => updateReservationStatus(reservation.id, e.target.value)}
                        className={`text-xs font-semibold rounded px-2 py-1 ${getStatusBadgeClass(reservation.status)}`}
                      >
                        <option value="pending">未処理</option>
                        <option value="confirmed">確認済</option>
                        <option value="completed">完了</option>
                        <option value="cancelled">キャンセル</option>
                        <option value="rejected">拒否</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseInt(reservation.payment_amount).toLocaleString()}円
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <Link href={`/admin/reservations/${reservation.id}`} className="hover:text-blue-900 mr-4">
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                <span>{currentPage}</span> / <span>{totalPages}</span> ページ
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
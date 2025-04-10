'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

type DashboardStats = {
  totalReservations: number;
  pendingReservations: number;
  completedReservations: number;
  totalRevenue: number;
  restaurantCount: number;
  recentReservations: any[];
};

// 支払いステータスに対応するテキストとカラークラスを取得する関数
const getPaymentStatusInfo = (status: string) => {
  switch (status) {
    case 'paid':
      return { text: '支払済', colorClass: 'bg-green-100 text-green-800' };
    case 'unpaid':
      return { text: '未払い', colorClass: 'bg-yellow-100 text-yellow-800' };
    case 'refunded':
      return { text: '返金済', colorClass: 'bg-blue-100 text-blue-800' };
    default:
      return { text: status || 'なし', colorClass: 'bg-gray-100 text-gray-800' };
  }
};

// 予約状況に対応するテキストとカラークラスを取得する関数
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'confirmed':
      return { text: '確認済', colorClass: 'bg-green-100 text-green-800' };
    case 'pending':
      return { text: '未処理', colorClass: 'bg-yellow-100 text-yellow-800' };
    case 'completed':
      return { text: '完了', colorClass: 'bg-blue-100 text-blue-800' };
    case 'cancelled':
    case 'canceled': // 両方のスペルに対応
      return { text: 'キャンセル', colorClass: 'bg-red-100 text-red-800' };
    default:
      return { text: status || '不明', colorClass: 'bg-gray-100 text-gray-800' };
  }
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalReservations: 0,
    pendingReservations: 0,
    completedReservations: 0,
    totalRevenue: 0,
    restaurantCount: 0,
    recentReservations: [],
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // RPC関数を呼び出して、すべてのダッシュボードデータを一度に取得
        const { data: dashboardData, error } = await supabase
          .rpc('get_admin_dashboard_stats');

        if (error) {
          console.error('ダッシュボードデータ取得RPC呼び出しエラー:', error);
          throw error;
        }

        console.log('ダッシュボードデータ:', dashboardData);

        if (dashboardData && !dashboardData.error) { // エラーがないか確認
          if (dashboardData.recent_reservations) {
            console.log('最近の予約データ:', dashboardData.recent_reservations);
          }
          
          setStats({
            totalReservations: dashboardData.total_reservations || 0,
            pendingReservations: dashboardData.pending_reservations || 0,
            completedReservations: dashboardData.completed_reservations || 0,
            totalRevenue: dashboardData.total_revenue || 0,
            restaurantCount: dashboardData.restaurant_count || 0,
            recentReservations: dashboardData.recent_reservations || [],
          });
        } else if (dashboardData && dashboardData.error) {
          console.error('ダッシュボードデータ取得エラー(関数内部):', dashboardData.error);
        }
      } catch (error) {
        console.error('ダッシュボードデータ取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">管理者ダッシュボード</h2>
      
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">総予約数</p>
              <p className="text-3xl font-bold">{stats.totalReservations}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-xl">📊</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">未処理予約</p>
              <p className="text-3xl font-bold">{stats.pendingReservations}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <span className="text-xl">⏳</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">総売上</p>
              <p className="text-3xl font-bold">{stats.totalRevenue.toLocaleString()}円</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-xl">💰</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">レストラン数</p>
              <p className="text-3xl font-bold">{stats.restaurantCount}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-xl">🍽️</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 最近の予約 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">最近の予約</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">レストラン</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">顧客名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">連絡先</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日時</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">人数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">予約状況</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">支払状況</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">予約日時</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">アクション</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentReservations && stats.recentReservations.length > 0 ? (
                stats.recentReservations.map((reservation) => {
                  const paymentStatusInfo = getPaymentStatusInfo(reservation.payment_status);
                  const statusInfo = getStatusInfo(reservation.status);
                  return (
                    <tr key={reservation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.id ? reservation.id.substring(0, 8) + '...' : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.restaurant_name || '不明'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.guest_name || '不明'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reservation.guest_email && <div className="text-xs">{reservation.guest_email}</div>}
                        {reservation.guest_phone && <div className="text-xs">{reservation.guest_phone}</div>}
                        {!reservation.guest_email && !reservation.guest_phone && <div className="text-xs">連絡先なし</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.reservation_date} {reservation.reservation_time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.number_of_people}名
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.colorClass}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${paymentStatusInfo.colorClass}`}>
                           {paymentStatusInfo.text}
                         </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.payment_amount 
                          ? parseInt(reservation.payment_amount).toLocaleString() + '円'
                          : '0円'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reservation.created_at || '不明'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Link href={`/admin/reservations/${reservation.id}`} className="text-blue-600 hover:text-blue-900">
                          詳細
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="px-6 py-4 text-center text-sm text-gray-500">
                    最近の予約はありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Link href="/admin/reservations" className="text-blue-600 hover:text-blue-900">
            すべての予約を表示 →
          </Link>
        </div>
      </div>
    </div>
  );
} 
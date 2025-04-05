'use client';

import React, { useState, useEffect } from 'react';
import { PricingPlansContainer } from './PricingPlansContainer';

// 料金プランの型定義
export interface PricePlan {
  id: string;
  name: string;
  price: number;
  description?: string;
  min_party_size: number;
  max_party_size: number;
}

// 仮の料金プラン取得関数
export const getPricePlanByPartySize = async (partySize: number): Promise<PricePlan | null> => {
  // 実際の実装ではAPIからデータを取得します
  const plans = [
    {
      id: 'basic',
      name: 'ベーシックプラン',
      price: 1000,
      description: '基本的な席予約プラン',
      min_party_size: 1,
      max_party_size: 4,
    },
    {
      id: 'standard',
      name: 'スタンダードプラン',
      price: 2000,
      description: 'スタンダードなコース料理付きプラン',
      min_party_size: 5,
      max_party_size: 8,
    },
    {
      id: 'premium',
      name: 'プレミアムプラン',
      price: 3000,
      description: '特別なコース料理と優先席付きプラン',
      min_party_size: 9,
      max_party_size: 12,
    },
  ];
  
  // 人数に合わせたプランを返す
  return plans.find(
    plan => partySize >= plan.min_party_size && partySize <= plan.max_party_size
  ) || null;
};

// すべての料金プランを取得する関数
export const getAllPricePlans = async (): Promise<PricePlan[]> => {
  // 実際の実装ではAPIからデータを取得します
  return [
    {
      id: 'basic',
      name: 'ベーシックプラン',
      price: 1000,
      description: '基本的な席予約プラン',
      min_party_size: 1,
      max_party_size: 4,
    },
    {
      id: 'standard',
      name: 'スタンダードプラン',
      price: 2000,
      description: 'スタンダードなコース料理付きプラン',
      min_party_size: 5,
      max_party_size: 8,
    },
    {
      id: 'premium',
      name: 'プレミアムプラン',
      price: 3000,
      description: '特別なコース料理と優先席付きプラン',
      min_party_size: 9,
      max_party_size: 12,
    },
  ];
};

interface EnhancedPricingPlansProps {
  partySize: string | number;
  language: 'ko' | 'ja' | 'en';
  onPlanSelect: (amount: number, planName?: string) => void;
  plans: PricePlan[];
  selectedPlanId?: string;
}

const EnhancedPricingPlans: React.FC<EnhancedPricingPlansProps> = ({
  partySize,
  language,
  onPlanSelect,
  plans: propPlans,
  selectedPlanId,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricePlan | null>(null);
  const [plans, setPlans] = useState<PricePlan[]>(propPlans);
  
  // partySizeを数値に変換
  const size = typeof partySize === 'string' ? parseInt(partySize, 10) || 1 : partySize;
  
  // 初期プランの読み込み
  useEffect(() => {
    const fetchInitialPlan = async () => {
      try {
        setLoading(true);
        
        // propsで渡されたplansが空の場合はAPIから取得
        if (propPlans.length === 0) {
          const fetchedPlans = await getAllPricePlans();
          setPlans(fetchedPlans);
        }
        
        // 人数に適したプランを取得
        const plan = await getPricePlanByPartySize(size);
        if (plan) {
          setSelectedPlan(plan);
          // 親コンポーネントに選択されたプランを通知
          onPlanSelect(plan.price, plan.name);
        }
      } catch (err) {
        console.error('料金プラン取得エラー:', err);
        setError(language === 'ja' 
          ? '料金プランの取得に失敗しました' 
          : language === 'en' 
          ? 'Failed to load pricing plans' 
          : '요금제 정보를 가져오지 못했습니다');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialPlan();
  }, [size, language, onPlanSelect, propPlans]);
  
  // プラン選択時のハンドラー
  const handleSelectPlan = (planId: string, price: number) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      onPlanSelect(price, plan.name);
    } else {
      onPlanSelect(price);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }
  
  return (
    <PricingPlansContainer
      partySize={size}
      language={language}
      onSelectPlan={handleSelectPlan}
    />
  );
};

export default EnhancedPricingPlans; 
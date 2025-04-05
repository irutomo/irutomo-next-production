import React, { useState, useEffect } from 'react';
import { PricingPlansContainer } from './ui/PricingPlansContainer';
import { getPricePlanByPartySize } from '../lib/pricePlanService';
import { PricePlan } from '../types/pricePlan';

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
  plans,
  selectedPlanId,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricePlan | null>(null);
  
  // partySize文字列を数値に変換し、無効な値の場合はデフォルト値を使用
  const size = parseInt(partySize.toString(), 10) || 1;
  
  // 初期プランの読み込み
  useEffect(() => {
    const fetchInitialPlan = async () => {
      try {
        setLoading(true);
        const plan = await getPricePlanByPartySize(size);
        if (plan) {
          setSelectedPlan(plan);
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
  }, [size, language]);
  
  // プラン選択時のハンドラー
  const handleSelectPlan = (productId: string, priceId: string, price: number) => {
    // 元のonPlanSelect関数に必要な情報を渡す
    onPlanSelect(price, productId);
    
    console.log(`プラン選択: 商品ID=${productId}, 価格ID=${priceId}, 金額=${price}`);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
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
  
  // サイズを渡す前に有効な数値であることを確認
  const validSize = isNaN(size) ? 1 : size;
  
  return (
    <PricingPlansContainer
      partySize={validSize}
      language={language}
      onSelectPlan={handleSelectPlan}
    />
  );
};

export default EnhancedPricingPlans; 
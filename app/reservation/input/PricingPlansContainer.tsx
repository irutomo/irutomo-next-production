'use client';

import React, { useState, useEffect } from 'react';
import { PricePlan, getAllPricePlans } from './EnhancedPricingPlans';
import RequestCommentModal from './RequestCommentModal';

interface PricingPlansContainerProps {
  partySize: number;
  language: 'ja' | 'en' | 'ko';
  onSelectPlan: (planId: string, price: number) => void;
}

export const PricingPlansContainer: React.FC<PricingPlansContainerProps> = ({
  partySize,
  language,
  onSelectPlan,
}) => {
  const [pricePlans, setPricePlans] = useState<PricePlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<PricePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PricePlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // 初回読み込み時に料金プランを取得
  useEffect(() => {
    const fetchPricePlans = async () => {
      try {
        setLoading(true);
        const plans = await getAllPricePlans();
        setPricePlans(plans);
      } catch (err) {
        console.error('料金プランの取得に失敗しました:', err);
        setError('料金プランの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPricePlans();
  }, []);
  
  // 人数が変更されたときおよびプランリストが更新されたときにフィルタリングとプラン選択を行う
  useEffect(() => {
    const filterAndSelectPlan = async () => {
      if (pricePlans.length === 0) return;
      
      try {
        // 現在の人数に適したプランを選択
        const matchingPlan = pricePlans.find(plan => 
          partySize >= plan.min_party_size && partySize <= plan.max_party_size
        );
        
        // すべてのプランを表示
        setFilteredPlans(pricePlans);
        
        if (matchingPlan) {
          setSelectedPlan(matchingPlan);
          console.log(`選択されたプラン: ${matchingPlan.name}, 言語: ${language}, 人数: ${partySize}`);
          
          // プラン情報を親コンポーネントに通知
          onSelectPlan(matchingPlan.id, matchingPlan.price);
          console.log(`プラン選択完了: 金額=${matchingPlan.price}${language === 'ko' ? 'ウォン' : language === 'en' ? 'ドル' : '円'}, プラン=${matchingPlan.name}`);
        } else {
          // 適合するプランがない場合はフォールバック
          const defaultAmount = partySize <= 4 ? 1000 : partySize <= 8 ? 2000 : 3000;
          onSelectPlan('default', defaultAmount);
          console.log(`フォールバックプラン金額: ${defaultAmount}${language === 'ko' ? 'ウォン' : language === 'en' ? 'ドル' : '円'}`);
        }
      } catch (err) {
        console.error('プランフィルタリング中にエラーが発生しました:', err);
        const defaultAmount = partySize <= 4 ? 1000 : partySize <= 8 ? 2000 : 3000;
        onSelectPlan('default', defaultAmount);
      }
    };
    
    filterAndSelectPlan();
  }, [partySize, pricePlans, onSelectPlan, language]);
  
  // プラン選択時の処理
  const handleSelectPlan = async (planIndex: number) => {
    if (filteredPlans.length > planIndex) {
      const plan = filteredPlans[planIndex];
      setSelectedPlan(plan);
      
      console.log(`handleSelectPlanで選択: ${plan.name}, 言語: ${language}, 人数: ${partySize}`);
      
      // プラン情報を親コンポーネントに通知
      onSelectPlan(plan.id, plan.price);
      console.log(`プラン手動選択完了: 金額=${plan.price}${language === 'ko' ? 'ウォン' : language === 'en' ? 'ドル' : '円'}, プラン=${plan.name}`);
    }
  };
  
  // 人数に基づいて適切なプランインデックスを計算
  const getActivePlanIndex = (): number => {
    if (filteredPlans.length === 0) return 0;
    
    // 人数に一致するプランを探す
    for (let i = 0; i < filteredPlans.length; i++) {
      const plan = filteredPlans[i];
      if (partySize >= plan.min_party_size && partySize <= plan.max_party_size) {
        return i;
      }
    }
    
    // 見つからない場合はデフォルト
    return 0;
  };
  
  // プランのラベル取得
  const getPlanLabel = (plan: PricePlan | null): string => {
    if (!plan) return '';
    
    return language === 'ko' 
      ? `${plan.min_party_size}-${plan.max_party_size}명` 
      : language === 'ja' 
      ? `${plan.min_party_size}-${plan.max_party_size}人` 
      : `${plan.min_party_size}-${plan.max_party_size} people`;
  };

  // 大人数リクエストモーダルを表示
  const handleShowRequestModal = () => {
    setShowRequestModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* 簡易的なプラン表示 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredPlans.map((plan, index) => (
          <div 
            key={plan.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              selectedPlan?.id === plan.id 
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-primary-300'
            }`}
            onClick={() => handleSelectPlan(index)}
          >
            <h4 className="font-bold text-lg mb-2">{plan.name}</h4>
            <p className="text-gray-600 text-sm mb-2">{getPlanLabel(plan)}</p>
            <p className="font-semibold text-primary-600 text-xl">
              {plan.price.toLocaleString()}
              {language === 'ko' ? 'ウォン' : language === 'en' ? 'ドル' : '円'}
            </p>
            {plan.description && (
              <p className="text-gray-500 text-sm mt-2">{plan.description}</p>
            )}
          </div>
        ))}
      </div>
      
      <p className="text-sm text-gray-500 mt-4 text-center">
        {language === 'ko'
          ? '현재 선택된 인원수: '
          : language === 'ja'
          ? '現在選択された人数: '
          : 'Current selected party size: '}
        <span className="font-medium">{partySize}</span>
        {language === 'ko'
          ? '명'
          : language === 'ja'
          ? '人'
          : ' people'}
      </p>
      
      {selectedPlan && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          {language === 'ko'
            ? `${selectedPlan.name} - ${selectedPlan.price}원`
            : language === 'ja'
            ? `${selectedPlan.name} - ${selectedPlan.price.toLocaleString()}円`
            : `${selectedPlan.name} - $${selectedPlan.price.toLocaleString()}`}
        </p>
      )}
    </div>
  );
}; 
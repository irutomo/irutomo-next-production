'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  isDefault?: boolean;
}

const plans: Plan[] = [
  {
    id: 'standard',
    name: '通常予約',
    description: '当日キャンセル可能な標準的な予約プランです',
    price: 0,
    features: [
      '当日3時間前までキャンセル無料',
      '席確保保証なし'
    ],
    isDefault: true
  },
  {
    id: 'premium',
    name: 'プレミアム予約',
    description: '確実に席を確保し、優先的にご案内するプランです',
    price: 1000,
    features: [
      '前日までキャンセル無料',
      '席確保保証あり',
      '優先案内'
    ]
  }
];

export default function PlanSelector() {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans.find(p => p.isDefault)?.id || plans[0].id);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlanId(planId);
    
    // フォームの hidden フィールドを更新
    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan) {
      const planInput = document.getElementById('plan') as HTMLInputElement;
      const amountInput = document.getElementById('plan_amount') as HTMLInputElement;
      
      if (planInput) planInput.value = selectedPlan.id;
      if (amountInput) amountInput.value = selectedPlan.price.toString();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedPlanId === plan.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {plan.description}
                </p>
                <ul className="mt-3 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">
                  {plan.price === 0 ? '¥0' : `¥${plan.price.toLocaleString()}`}
                </span>
                <p className="text-xs text-gray-500">予約料金</p>
              </div>
            </div>
            <div className="mt-4">
              <div 
                className={`border rounded-full w-5 h-5 ${
                  selectedPlanId === plan.id 
                  ? 'border-primary-500 flex items-center justify-center' 
                  : 'border-gray-300'
                }`}
              >
                {selectedPlanId === plan.id && (
                  <div className="bg-primary-500 rounded-full w-3 h-3"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
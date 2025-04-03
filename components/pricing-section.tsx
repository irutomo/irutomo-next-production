export function PricingSection() {
  return (
    <section className="py-16 bg-gray-50" id="pricing">
      <div className="container max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">料金案内</h2>
        
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <div className="text-center">
            <h3 className="text-4xl font-bold text-primary-500 mb-2">¥1,000</h3>
            <p className="text-gray-600 text-sm mb-6">予約1件につき手数料</p>
            
            <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 rounded-md transition-colors">
              予約する
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 
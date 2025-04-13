import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * CSPレポートを受け取るエンドポイント
 * CSPヘッダーのreport-uriディレクティブで指定されているエンドポイント
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // CSPレポートのログ出力（本番環境では構造化ロギングに置き換えることを推奨）
    console.warn('CSP Violation Report:', {
      blockedUri: body['csp-report']?.['blocked-uri'],
      violatedDirective: body['csp-report']?.['violated-directive'],
      documentUri: body['csp-report']?.['document-uri'],
      referrer: body['csp-report']?.['referrer'],
      originalPolicy: body['csp-report']?.['original-policy'],
      timestamp: new Date().toISOString(),
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('CSPレポート処理エラー:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 
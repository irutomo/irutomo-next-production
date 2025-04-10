// コードリサーチMCPのテスト
const axios = require('axios');

async function testCodeResearchMCP() {
  try {
    console.log('コードリサーチMCPテストを開始します...');
    
    // MCPサーバーのエンドポイント（デフォルトポート）
    const endpoint = 'http://localhost:3000';
    
    // Stack Overflowで「next.js api routes」について検索するクエリ
    const query = {
      query: 'next.js api routes',
      source: 'stackoverflow'
    };
    
    console.log('リクエスト送信中:', JSON.stringify(query));
    
    // MCPサーバーにリクエストを送信
    const response = await axios.post(`${endpoint}/search`, query);
    
    console.log('レスポンス受信:');
    console.log('ステータスコード:', response.status);
    console.log('データ:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
    
    console.log('テスト完了');
    return response.data;
  } catch (error) {
    console.error('エラーが発生しました:');
    console.error(error.message);
    if (error.response) {
      console.error('レスポンスデータ:', error.response.data);
      console.error('ステータスコード:', error.response.status);
    }
  }
}

// テスト実行
testCodeResearchMCP(); 
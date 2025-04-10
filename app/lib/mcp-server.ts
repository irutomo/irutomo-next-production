import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

// 環境変数の検証
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// MCPサーバーの設定
export const mcpConfig = {
  maxConnections: 10,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  heartbeatInterval: 5000, // 5 seconds
  debug: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'production',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'IRUTOMO reserve'
};

// Supabaseクライアントの作成
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public',
    },
  }
);

// MCPメッセージハンドラー
export interface MCPMessage {
  type: 'REQUEST' | 'RESPONSE' | 'ERROR';
  payload: any;
  timestamp: number;
  environment?: string;
  appName?: string;
}

export class MCPServer {
  private static instance: MCPServer;
  private messageQueue: MCPMessage[] = [];
  private readonly config: typeof mcpConfig;

  private constructor() {
    this.config = mcpConfig;
    if (this.config.debug) {
      console.log('MCPServer initialized with config:', this.config);
    }
  }

  public static getInstance(): MCPServer {
    if (!MCPServer.instance) {
      MCPServer.instance = new MCPServer();
    }
    return MCPServer.instance;
  }

  public async sendMessage(message: MCPMessage): Promise<void> {
    try {
      // 環境情報の追加
      const enrichedMessage = {
        ...message,
        environment: this.config.environment,
        appName: this.config.appName,
      };

      // メッセージをキューに追加
      this.messageQueue.push(enrichedMessage);

      if (this.config.debug) {
        console.log('Sending message:', enrichedMessage);
      }

      // Supabaseにメッセージを保存
      const { error } = await supabase
        .from('mcp_messages')
        .insert([
          {
            type: enrichedMessage.type,
            payload: enrichedMessage.payload,
            timestamp: enrichedMessage.timestamp,
            environment: enrichedMessage.environment,
            app_name: enrichedMessage.appName,
          },
        ]);

      if (error) {
        console.error('Error inserting message to Supabase:', error);
        throw error;
      }

      // キューの処理
      await this.processMessageQueue();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  private async processMessageQueue(): Promise<void> {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (!message) continue;

      try {
        // メッセージの処理ロジック
        switch (message.type) {
          case 'REQUEST':
            await this.handleRequest(message);
            break;
          case 'RESPONSE':
            await this.handleResponse(message);
            break;
          case 'ERROR':
            await this.handleError(message);
            break;
        }
      } catch (error) {
        console.error('Error processing message:', error);
        if (this.config.debug) {
          console.error('Message that caused error:', message);
        }
      }
    }
  }

  private async handleRequest(message: MCPMessage): Promise<void> {
    if (this.config.debug) {
      console.log('Processing request:', message);
    }
    // リクエストの処理ロジックをここに実装
  }

  private async handleResponse(message: MCPMessage): Promise<void> {
    if (this.config.debug) {
      console.log('Processing response:', message);
    }
    // レスポンスの処理ロジックをここに実装
  }

  private async handleError(message: MCPMessage): Promise<void> {
    console.error('Processing error:', message);
    // エラーの処理ロジックをここに実装
  }
}

// MCPサーバーのインスタンスをエクスポート
export const mcpServer = MCPServer.getInstance(); 
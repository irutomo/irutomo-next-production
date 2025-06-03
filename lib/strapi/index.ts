// ===================================
// Strapi Client エクスポートインデックス
// ===================================

// 新しい統合サービスをメインエクスポートとして提供
export * from '../services/japan-info';

// 個別クライアントも必要に応じて利用可能
export { StrapiClient } from '../clients/strapi';
export { SupabaseClient } from '../clients/supabase';

// ユーティリティ
export { logger } from '../utils/logger';
export { JapanInfoTransformer } from '../transformers/japan-info';
export { getEnvironmentConfig, validateStrapiConfig, validateSupabaseConfig } from '../config/environment'; 
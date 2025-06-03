// ===================================
// 環境設定管理
// ===================================

export interface EnvironmentConfig {
  strapi: {
    url: string | undefined;
    apiToken: string | undefined;
    apiEndpoint: string;
  };
  supabase: {
    url: string | undefined;
    anonKey: string | undefined;
  };
  debug: {
    enabled: boolean;
  };
}

export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    strapi: {
      url: process.env.NEXT_PUBLIC_STRAPI_URL,
      apiToken: process.env.STRAPI_API_TOKEN,
      apiEndpoint: '/api/japan-info-articles',
    },
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    debug: {
      enabled: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    },
  };
}

export function validateStrapiConfig(): { isValid: boolean; errors: string[] } {
  const config = getEnvironmentConfig();
  const errors: string[] = [];
  
  if (!config.strapi.url) {
    errors.push('NEXT_PUBLIC_STRAPI_URL is not set');
  }
  
  if (!config.strapi.apiToken) {
    errors.push('STRAPI_API_TOKEN is not set');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateSupabaseConfig(): { isValid: boolean; errors: string[] } {
  const config = getEnvironmentConfig();
  const errors: string[] = [];
  
  if (!config.supabase.url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  
  if (!config.supabase.anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
} 
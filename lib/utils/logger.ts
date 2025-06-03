// ===================================
// ログユーティリティ
// ===================================

import { getEnvironmentConfig } from '../config/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  component?: string;
  function?: string;
  data?: any;
}

class Logger {
  private isDebugEnabled: boolean;

  constructor() {
    this.isDebugEnabled = getEnvironmentConfig().debug.enabled;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (context?.component && context?.function) {
      return `${prefix} [${context.component}:${context.function}] ${message}`;
    } else if (context?.component) {
      return `${prefix} [${context.component}] ${message}`;
    }
    
    return `${prefix} ${message}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDebugEnabled) {
      console.log(this.formatMessage('debug', message, context), context?.data || '');
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context), context?.data || '');
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context), context?.data || '');
  }

  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage('error', message, context), context?.data || '');
  }
}

export const logger = new Logger();

// 従来の関数も互換性のため提供
export const debugLog = (message: string, data?: any) => {
  logger.debug(`[Strapi Debug] ${message}`, { data });
};

export const errorLog = (message: string, error?: any) => {
  logger.error(`[Strapi Client ERROR] ${message}`, { data: error });
};

export const warningLog = (message: string, data?: any) => {
  logger.warn(`[Strapi Client WARNING] ${message}`, { data });
}; 
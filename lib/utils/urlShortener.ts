/**
 * URL 단축 서비스 유틸리티
 */

export interface CompressedParams {
  t?: string; // title
  p?: string[]; // participants
  d?: string; // template/dates
  m?: number; // months
}

/**
 * 짧은 코드 생성 (6자리)
 */
export function generateShortCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * URL 파라미터를 객체로 압축
 */
export function compressUrlParams(params: URLSearchParams): CompressedParams {
  const compressed: CompressedParams = {};
  
  // title
  const title = params.get('title');
  if (title) {
    compressed.t = decodeURIComponent(title);
  }
  
  // participants
  const participants = params.get('participants');
  if (participants) {
    compressed.p = decodeURIComponent(participants).split(',');
  }
  
  // template
  const template = params.get('template');
  if (template) {
    compressed.d = template;
  }
  
  // months
  const months = params.get('months');
  if (months) {
    compressed.m = parseInt(months);
  }
  
  return compressed;
}

/**
 * 압축된 객체를 URL 파라미터로 복원
 */
export function decompressToUrlParams(compressed: CompressedParams): URLSearchParams {
  const params = new URLSearchParams();
  
  // title
  if (compressed.t) {
    params.set('title', compressed.t);
  }
  
  // participants
  if (compressed.p && Array.isArray(compressed.p)) {
    params.set('participants', compressed.p.join(','));
  }
  
  // template
  if (compressed.d) {
    params.set('template', compressed.d);
  }
  
  // months
  if (compressed.m) {
    params.set('months', compressed.m.toString());
  }
  
  return params;
}
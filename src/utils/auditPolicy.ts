import { InspectRuleItem } from '../types';

/**
 * 审核判定收口（createRecord / resubmitRecord / 表单提示共用）：
 * - 加分（score > 0）恒送审，关闭免审刷分敞口；
 * - 扣分/常规：德育处审批开启且规则要求审核时送审，否则即时生效。
 */
export function decideAudit(
  rule: InspectRuleItem | undefined,
  score: number,
  moralAuditEnabled: boolean
): 'pending_audit' | 'active' {
  if (score > 0) return 'pending_audit';
  if (moralAuditEnabled && (rule?.requiresAudit ?? true)) return 'pending_audit';
  return 'active';
}

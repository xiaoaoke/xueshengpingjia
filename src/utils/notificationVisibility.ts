import { NotificationItem, UserProfile } from '../types';

/**
 * 通知可见性统一谓词（未读角标与通知抽屉必须共用，杜绝角标≠列表）：
 * - 按 targetRole 过滤（'all' 或与查看者角色一致）；
 * - 班级定向通知仅本班班主任可见，管理员/值周教师可看全部班级。
 */
export function isNotifVisible(n: NotificationItem, user: UserProfile): boolean {
  if (n.targetRole !== 'all' && n.targetRole !== user.role) return false;
  if (!n.targetClassId) return true;
  if (user.role === 'homeroom_teacher') {
    return n.targetClassId === (user.homeroomClassId || 'class_g1_1');
  }
  return true;
}

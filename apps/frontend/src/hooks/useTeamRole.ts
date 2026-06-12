import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

export type MemberRole =
  | 'COACH'
  | 'ASSISTANT_COACH'
  | 'TEAM_MANAGER'
  | 'SCOREKEEPER'
  | 'PLAYER'
  | 'PARENT';

interface Member {
  id: string;
  userId: string;
  role: MemberRole;
}

export const WRITE_ROLES: MemberRole[] = ['COACH', 'ASSISTANT_COACH', 'TEAM_MANAGER'];

export function canWrite(role: MemberRole): boolean {
  return WRITE_ROLES.includes(role);
}

function roleKey(teamId: string): string {
  return `tm-team-role-${teamId}`;
}

export function clearAllRoleCaches(): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i);
    if (k?.startsWith('tm-team-role-')) keysToRemove.push(k);
  }
  for (const k of keysToRemove) sessionStorage.removeItem(k);
}

export function useTeamRole(teamId: string | undefined): MemberRole {
  const { user } = useAuth();
  const [role, setRole] = useState<MemberRole>(() => {
    if (!teamId) return 'PLAYER';
    const cached = sessionStorage.getItem(roleKey(teamId));
    return (cached as MemberRole | null) ?? 'PLAYER';
  });

  useEffect(() => {
    if (!teamId || !user) return;
    api
      .get<Member[]>(`/teams/${teamId}/members`)
      .then((members) => {
        const me = members.find((m) => m.userId === user.id);
        if (me) {
          sessionStorage.setItem(roleKey(teamId), me.role);
          setRole(me.role);
        }
      })
      .catch(() => {
        sessionStorage.removeItem(roleKey(teamId));
      });
  }, [teamId, user]);

  return role;
}

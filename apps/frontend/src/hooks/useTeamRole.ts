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

export function useTeamRole(teamId: string | undefined): MemberRole {
  const { user } = useAuth();
  const [role, setRole] = useState<MemberRole>('PLAYER');

  useEffect(() => {
    if (!teamId || !user) return;
    api
      .get<Member[]>(`/teams/${teamId}/members`)
      .then((members) => {
        const me = members.find((m) => m.userId === user.id);
        if (me) setRole(me.role);
      })
      .catch(() => {
        // fail safe — keep 'PLAYER' default on error
      });
  }, [teamId, user]);

  return role;
}

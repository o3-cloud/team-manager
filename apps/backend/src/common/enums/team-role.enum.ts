export enum TeamRole {
  COACH = 'COACH',
  ASSISTANT_COACH = 'ASSISTANT_COACH',
  TEAM_MANAGER = 'TEAM_MANAGER',
  SCOREKEEPER = 'SCOREKEEPER',
  PLAYER = 'PLAYER',
  PARENT = 'PARENT',
}

export const WRITE_EVENT_ROLES = [TeamRole.COACH, TeamRole.ASSISTANT_COACH, TeamRole.TEAM_MANAGER];
export const WRITE_ROSTER_ROLES = [TeamRole.COACH, TeamRole.ASSISTANT_COACH];
export const MANAGE_TEAM_ROLES = [TeamRole.COACH];
export const ALL_MEMBER_ROLES = Object.values(TeamRole);

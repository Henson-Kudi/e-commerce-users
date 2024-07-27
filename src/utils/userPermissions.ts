import qs from 'qs';
import { ResourceAccessLevels, ResourceAccessType } from '../domain/enums';
import { PermissionRegex } from './constants/permissions';

function parsePermission(permission: string) {
  const [userLevel, groupLevel, allLevel] = permission.split('|');
  return { userLevel, groupLevel, allLevel };
}

function combineAccess(existing: string, newAccess: string) {
  let result = '';
  for (let i = 0; i < 4; i++) {
    result +=
      existing[i] === '-' && newAccess[i] !== '-' ? newAccess[i] : existing[i];
  }
  return result;
}

export default function combineUserPermissions(permissions: string[]) {
  if (permissions.length === 0) {
    return { userLevel: '----', groupLevel: '----', allLevel: '----' };
  }

  const combined = permissions.reduce(
    (acc, permission) => {
      const parsed = parsePermission(permission);

      acc.userLevel = combineAccess(acc.userLevel, parsed.userLevel);
      acc.groupLevel = combineAccess(acc.groupLevel, parsed.groupLevel);
      acc.allLevel = combineAccess(acc.allLevel, parsed.allLevel);

      return acc;
    },
    { userLevel: '----', groupLevel: '----', allLevel: '----' }
  );

  return combined;
}

export function determinAccessLevel(
  {
    userLevel,
    groupLevel,
    allLevel,
  }: { userLevel: string; groupLevel: string; allLevel: string },
  accessType: ResourceAccessType
): ResourceAccessLevels {
  // if combination of all access levels cannot form a permission then return false
  if (!PermissionRegex.test(`${userLevel}|${groupLevel}|${allLevel}`)) {
    return ResourceAccessLevels.None;
  }

  if (
    !allLevel.includes(accessType) &&
    !groupLevel.includes(accessType) &&
    !userLevel.includes(accessType)
  ) {
    return ResourceAccessLevels.None;
  }

  if (allLevel.includes(accessType)) {
    return ResourceAccessLevels.All;
  }

  if (groupLevel.includes(accessType)) {
    return ResourceAccessLevels.Group;
  }

  if (userLevel.includes(accessType)) {
    return ResourceAccessLevels.User;
  }

  return ResourceAccessLevels.None;
}

export function buildExtendedQuery(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
) {
  const keys = path.match(/[^[\].]+(?=\]|\[|\.)|\w+/g); // Split by dot and brackets
  if (!keys) return;

  if (keys.length > 2) {
    return;
  }

  const mainKey = keys[0];

  const parsed = qs.parse(`${path}=${Array.isArray(value) ? value : value}`, {
    allowDots: true,
    comma: true,
    depth: 1,
  });

  obj[mainKey] = parsed[mainKey];

  return obj;
}

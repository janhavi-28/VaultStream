export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['*'],
  [ROLES.EDITOR]: ['upload_video', 'edit_own_video', 'delete_own_video', 'view_all'],
  [ROLES.VIEWER]: ['view_own_video']
};

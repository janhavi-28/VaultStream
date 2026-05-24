export const tenantOrganizations = [
  {
    id: 'org-northstar',
    name: 'Northstar Media',
    slug: 'northstar',
    plan: 'Enterprise',
    members: 48,
    storageUsed: '8.2 TB',
    activeProjects: 14,
    inviteDomain: 'northstar.io',
  },
  {
    id: 'org-helio',
    name: 'Helio Learning',
    slug: 'helio',
    plan: 'Growth',
    members: 31,
    storageUsed: '4.1 TB',
    activeProjects: 9,
    inviteDomain: 'helio.edu',
  },
  {
    id: 'org-apex',
    name: 'Apex Sports',
    slug: 'apex',
    plan: 'Enterprise',
    members: 56,
    storageUsed: '5.0 TB',
    activeProjects: 18,
    inviteDomain: 'apexsports.tv',
  },
];

export const workspaceCatalog = [
  { id: 'ws-1', tenantId: 'org-northstar', name: 'Brand Studio', description: 'Campaign launches, trailers, and social cutdowns.', members: 12, privacy: 'Private' },
  { id: 'ws-2', tenantId: 'org-northstar', name: 'Live Events', description: 'Streams, recap clips, and event recordings.', members: 18, privacy: 'Shared' },
  { id: 'ws-3', tenantId: 'org-helio', name: 'Curriculum Vault', description: 'Lecture assets and student-safe publishing flow.', members: 11, privacy: 'Private' },
  { id: 'ws-4', tenantId: 'org-helio', name: 'Faculty Media Lab', description: 'Department uploads and review-ready drafts.', members: 7, privacy: 'Shared' },
  { id: 'ws-5', tenantId: 'org-apex', name: 'Matchday Ops', description: 'Rapid highlights, match clips, and publishing QA.', members: 20, privacy: 'Private' },
  { id: 'ws-6', tenantId: 'org-apex', name: 'Press Room', description: 'Interviews, conference cuts, and approvals.', members: 10, privacy: 'Shared' },
];

export const teamMembersSeed = [
  { id: 'tm-1', tenantId: 'org-northstar', name: 'Ava Chen', email: 'ava@northstar.io', role: 'Owner', status: 'Active', workspace: 'Brand Studio' },
  { id: 'tm-2', tenantId: 'org-northstar', name: 'Miles Ford', email: 'miles@northstar.io', role: 'Editor', status: 'Active', workspace: 'Live Events' },
  { id: 'tm-3', tenantId: 'org-helio', name: 'Nina George', email: 'nina@helio.edu', role: 'Admin', status: 'Active', workspace: 'Curriculum Vault' },
  { id: 'tm-4', tenantId: 'org-helio', name: 'Ethan Shaw', email: 'ethan@helio.edu', role: 'Reviewer', status: 'Pending', workspace: 'Faculty Media Lab' },
  { id: 'tm-5', tenantId: 'org-apex', name: 'Lena Ortiz', email: 'lena@apexsports.tv', role: 'Owner', status: 'Active', workspace: 'Matchday Ops' },
  { id: 'tm-6', tenantId: 'org-apex', name: 'Kai Morgan', email: 'kai@apexsports.tv', role: 'Editor', status: 'Suspended', workspace: 'Press Room' },
];

export const inviteSeed = [
  { id: 'inv-1', tenantId: 'org-northstar', email: 'partner@northstar.io', role: 'Reviewer', workspace: 'Brand Studio', status: 'Pending', sentAt: '2h ago' },
  { id: 'inv-2', tenantId: 'org-helio', email: 'producer@helio.edu', role: 'Editor', workspace: 'Curriculum Vault', status: 'Accepted', sentAt: '1d ago' },
  { id: 'inv-3', tenantId: 'org-apex', email: 'coach@apexsports.tv', role: 'Viewer', workspace: 'Matchday Ops', status: 'Pending', sentAt: '28m ago' },
];

export const tenantSettingsSeed = {
  'org-northstar': { moderationMode: 'Balanced', defaultRole: 'Viewer', uploadPolicy: 'Editors and above', watermarking: true },
  'org-helio': { moderationMode: 'Strict', defaultRole: 'Reviewer', uploadPolicy: 'Admins and editors', watermarking: false },
  'org-apex': { moderationMode: 'Balanced', defaultRole: 'Viewer', uploadPolicy: 'Workspace members', watermarking: true },
};

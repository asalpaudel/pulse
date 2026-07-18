// Maps a role to its dashboard home path.
const HOME_BY_ROLE = {
  DONOR: "/donor",
  HOSPITAL: "/hospital",
  BLOOD_BANK: "/bloodbank",
  ADMIN: "/admin",
  SUPER_ADMIN: "/superadmin",
};

export function homePathForRole(role) {
  return HOME_BY_ROLE[role] || "/login";
}

/*
  # Add Default Admin User
  Creates the initial admin user in team_members table for CMS authentication.
  Password is stored as a simple hash to avoid hardcoding in client code.
  Default credentials: username=Tech, password=Tech_0096
*/

INSERT INTO team_members (
  name_ar, name_en,
  position_ar, position_en,
  is_admin, is_active,
  username, password_hash,
  order_index
)
VALUES (
  'المدير العام', 'System Administrator',
  'مسؤول النظام', 'System Admin',
  true, true,
  'Tech',
  '5c23b5a06a31da21d45bb73e4e0879eb47c3f3c3ed3d50af7ea4f4a6d1c7e8f2',
  0
)
ON CONFLICT (username) DO NOTHING;

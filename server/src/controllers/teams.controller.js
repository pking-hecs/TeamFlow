import * as Team from '../models/team.model.js';
async function requireMembership(teamId, userId, res) {
  const member = await Team.getMember(teamId, userId);
  if (!member) {
    res.status(403).json({ error: 'You are not a member of this team' });
    return null;
  }
  return member;
}
async function requireAdmin(teamId, userId, res) {
  const member = await requireMembership(teamId, userId, res);
  if (!member) return null;
  if (member.role !== 'admin') {
    res.status(403).json({ error: 'Admin privileges required' });
    return null;
  }
  return member;
}
export async function createTeam(req, res) {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Team name is required' });
    }
    const team = await Team.createTeam({
      name: name.trim(),
      description: description?.trim() || null,
      userId: req.user.id,
    });
    res.status(201).json({ data: team });
  } catch (err) {
    console.error('[createTeam]', err);
    res.status(500).json({ error: 'Failed to create team' });
  }
}
export async function getTeams(req, res) {
  try {
    const teams = await Team.getTeamsByUser(req.user.id);
    res.json({ data: teams });
  } catch (err) {
    console.error('[getTeams]', err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
}
export async function getTeam(req, res) {
  try {
    const team = await Team.getTeamById(Number(req.params.id), req.user.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found or access denied' });
    }
    res.json({ data: team });
  } catch (err) {
    console.error('[getTeam]', err);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
}
export async function updateTeam(req, res) {
  try {
    const teamId = Number(req.params.id);
    const admin = await requireAdmin(teamId, req.user.id, res);
    if (!admin) return;
    const { name, description } = req.body;
    if (!name && description === undefined) {
      return res.status(400).json({ error: 'Nothing to update' });
    }
    await Team.updateTeam(teamId, { name, description });
    const updated = await Team.getTeamById(teamId, req.user.id);
    res.json({ data: updated });
  } catch (err) {
    console.error('[updateTeam]', err);
    res.status(500).json({ error: 'Failed to update team' });
  }
}
export async function deleteTeam(req, res) {
  try {
    const teamId = Number(req.params.id);
    const admin = await requireAdmin(teamId, req.user.id, res);
    if (!admin) return;
    await Team.deleteTeam(teamId);
    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    console.error('[deleteTeam]', err);
    res.status(500).json({ error: 'Failed to delete team' });
  }
}
export async function addMember(req, res) {
  try {
    const teamId = Number(req.params.id);
    const admin = await requireAdmin(teamId, req.user.id, res);
    if (!admin) return;
    const { email, role = 'member' } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Role must be admin or member' });
    }
    const user = await Team.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No user found with that email' });
    }
    const result = await Team.addMember(teamId, user.id, role);
    if (result?.alreadyMember) {
      return res.status(409).json({ error: 'User is already a team member' });
    }
    res.status(201).json({ data: result });
  } catch (err) {
    console.error('[addMember]', err);
    res.status(500).json({ error: 'Failed to add member' });
  }
}
export async function updateMemberRole(req, res) {
  try {
    const teamId = Number(req.params.id);
    const userId = Number(req.params.userId);
    const admin = await requireAdmin(teamId, req.user.id, res);
    if (!admin) return;
    const { role } = req.body;
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Role must be admin or member' });
    }
    if (role === 'member') {
      const targetMember = await Team.getMember(teamId, userId);
      if (targetMember?.role === 'admin') {
        const adminCount = await Team.countAdmins(teamId);
        if (adminCount <= 1) {
          return res.status(400).json({ error: 'Cannot demote the last admin' });
        }
      }
    }
    const target = await Team.getMember(teamId, userId);
    if (!target) return res.status(404).json({ error: 'Member not found' });
    await Team.updateMemberRole(teamId, userId, role);
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    console.error('[updateMemberRole]', err);
    res.status(500).json({ error: 'Failed to update role' });
  }
}
export async function removeMember(req, res) {
  try {
    const teamId = Number(req.params.id);
    const userId = Number(req.params.userId);
    const selfAction = req.user.id === userId;
    const requester = await requireMembership(teamId, req.user.id, res);
    if (!requester) return;
    if (!selfAction && requester.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required to remove others' });
    }
    const targetMember = await Team.getMember(teamId, userId);
    if (!targetMember) return res.status(404).json({ error: 'Member not found' });
    if (targetMember.role === 'admin') {
      const adminCount = await Team.countAdmins(teamId);
      if (adminCount <= 1) {
        return res.status(400).json({
          error: 'Cannot remove the last admin. Transfer ownership first.',
        });
      }
    }
    await Team.removeMember(teamId, userId);
    res.json({
      message: selfAction ? 'Left team successfully' : 'Member removed successfully',
    });
  } catch (err) {
    console.error('[removeMember]', err);
    res.status(500).json({ error: 'Failed to remove member' });
  }
}
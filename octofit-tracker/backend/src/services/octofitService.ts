import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') throw httpError(400, 'Valid activity fields are required');
  const { userId, teamId, type, minutes } = input as { userId?: unknown; teamId?: unknown; type?: unknown; minutes?: unknown };
  if (typeof userId !== 'string' || !mongoose.isValidObjectId(userId) ||
      typeof teamId !== 'string' || !mongoose.isValidObjectId(teamId)) {
    throw httpError(400, 'Valid userId and teamId are required');
  }
  if (typeof type !== 'string' || !type.trim()) throw httpError(400, 'Activity type is required');
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw httpError(400, 'Minutes must be a positive number');
  }
  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) throw httpError(404, 'User or team not found');
  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') throw httpError(400, 'Valid team fields are required');
  const { name, mascot, members } = input as { name?: unknown; mascot?: unknown; members?: unknown };
  if (typeof name !== 'string' || !name.trim()) throw httpError(400, 'Team name is required');
  if (typeof mascot !== 'string' || !mascot.trim()) throw httpError(400, 'Team mascot is required');
  const memberIds = Array.isArray(members)
    ? members.filter((member): member is string => typeof member === 'string' && mongoose.isValidObjectId(member))
    : [];
  const team = await Team.create({ name: name.trim(), mascot: mascot.trim(), members: memberIds });
  if (memberIds.length) await User.updateMany({ _id: { $in: memberIds } }, { $set: { team: team._id } });
  return team;
}

export async function getLeaderboard() {
  const teams = await Team.find().lean();
  const totals = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
  ]);
  const totalsByTeam = new Map(totals.map((entry) => [entry._id.toString(), entry.totalPoints as number]));
  return teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: totalsByTeam.get(team._id.toString()) ?? 0,
    }))
    .filter((entry) => entry.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail });
  if (!user) throw httpError(404, 'User not found');
  const recent = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(1).lean();
  const recentType = recent[0]?.type?.toLowerCase();
  const inferredFocus = recentType?.includes('strength') ? 'strength'
    : recentType?.includes('run') || recentType?.includes('cycle') ? 'endurance'
    : user.fitnessGoal?.toLowerCase();
  const focus = inferredFocus || user.fitnessGoal;
  const workouts = await Workout.find().lean();
  const matching = workouts.find((workout) => workout.focus.toLowerCase() === focus?.toLowerCase());
  const workout = matching ?? workouts[0];
  if (!workout) return [];
  return [{
    ...workout,
    reason: recentType
      ? `Recommended for your recent ${recentType} activity and ${focus} focus`
      : `Recommended for your ${focus} fitness goal`,
  }];
}

export { User };

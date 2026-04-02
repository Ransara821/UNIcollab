import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getStudyGroups, createStudyGroup, getMyGroup, toggleGroupStatus, updateSkillsNeeded, updateStudyGroup,
  sendJoinRequest, sendGroupInvite, getMyStudyRequests, getGroupRequests, updateJoinRequest,
  getStudySuggestions, getGrouplessPool, getMyStudyProfile, saveStudyProfile,
} from '../../services/api';

const TABS = [
  { id: 'discover', label: 'Discover',      icon: '🔍' },
  { id: 'create',   label: 'Create Group',  icon: '＋' },
  { id: 'profile',  label: 'My Profile',    icon: '◉' },
  { id: 'requests', label: 'Requests',      icon: '◈' },
  { id: 'pool',     label: 'Student Pool',  icon: '⊞' },
  { id: 'myGroup',  label: 'My Group',      icon: '⊛' },
];
const DAYS  = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const SLOTS = ['morning','afternoon','evening'];
const STATUS_BADGE = {
  pending:    'bg-yellow-100 text-yellow-700',
  accepted:   'bg-emerald-100 text-emerald-700',
  declined:   'bg-red-100 text-red-700',
  withdrawn:  'bg-slate-100 text-slate-500',
  waitlisted: 'bg-blue-100 text-blue-700',
};
const uid = (u) => u?.id || u?._id?.toString() || '';

export default function StudyGroupFinder() {
  const { user } = useAuth();
  const [activeTab, setActiveTab]         = useState('discover');
  const [groups, setGroups]               = useState([]);
  const [suggestions, setSuggestions]     = useState([]);
  const [myRequests, setMyRequests]       = useState([]);
  const [pool, setPool]                   = useState([]);
  const [myGroup, setMyGroup]             = useState(null);
  const [myGroupRole, setMyGroupRole]     = useState(null);
  const [groupReqs, setGroupReqs]         = useState([]);
  const [loading, setLoading]             = useState({});
  const [actLoad, setActLoad]             = useState({});
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const [search, setSearch]               = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterStyle, setFilterStyle]     = useState('');
  const [filterStatus, setFilterStatus]   = useState('open');
  const [pf, setPf] = useState({
    year: 1, semester: 1, gpa: '', faculty: '', skills: [], workingStyle: 'mixed',
    availability: {}, deadline: '', sosFlag: false, status: 'lookingForGroup',
  });
  const [skillInput, setSkillInput]             = useState('');
  const [skillsNeededInput, setSkillsNeededInput] = useState('');
  const [profileSaved, setProfileSaved]         = useState(false);

  // Create group form
  const [newGroup, setNewGroup] = useState({
    name: '', groupNumber: '', subject: '', description: '',
    requiredSkills: [], workingStyle: 'mixed', maxSize: 5, deadline: '',
  });
  const [newSkillInput, setNewSkillInput] = useState('');

  // Edit group form
  const [editingGroup, setEditingGroup]   = useState(false);
  const [editGroup, setEditGroup]         = useState({});
  const [editSkillInput, setEditSkillInput] = useState('');

  const setL = (k, v) => setLoading(p => ({ ...p, [k]: v }));
  const setA = (k, v) => setActLoad(p => ({ ...p, [k]: v }));

  const notify = (msg, isErr = false) => {
    if (isErr) { setError(msg); setSuccess(''); }
    else { setSuccess(msg); setError(''); }
  };

  useEffect(() => {
    if (success || error) {
      const t = setTimeout(() => { setSuccess(''); setError(''); }, 4000);
      return () => clearTimeout(t);
    }
  }, [success, error]);

  const fetchGroups = useCallback(async () => {
    setL('groups', true);
    try {
      const params = {};
      if (search)        params.search       = search;
      if (filterSubject) params.subject      = filterSubject;
      if (filterStyle)   params.workingStyle = filterStyle;
      if (filterStatus)  params.status       = filterStatus;
      const r = await getStudyGroups(params);
      setGroups(r.data);
    } catch { /* silent */ } finally { setL('groups', false); }
  }, [search, filterSubject, filterStyle, filterStatus]);

  const fetchSuggestions = useCallback(async () => {
    try { const r = await getStudySuggestions(); setSuggestions(r.data); } catch { /* profile not set */ }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const r = await getMyStudyProfile();
      setPf({
        year:         r.data.year || 1,
        semester:     r.data.semester || 1,
        gpa:          r.data.gpa !== undefined ? r.data.gpa : '',
        faculty:      r.data.faculty || '',
        skills:       r.data.skills || [],
        workingStyle: r.data.workingStyle || 'mixed',
        availability: r.data.availability || {},
        deadline:     r.data.deadline ? r.data.deadline.split('T')[0] : '',
        sosFlag:      r.data.sosFlag || false,
        status:       r.data.status || 'lookingForGroup',
      });
      setProfileSaved(!!(r.data.faculty && r.data.skills?.length));
    } catch { setProfileSaved(false); }
  }, []);

  const fetchMyRequests = useCallback(async () => {
    try { const r = await getMyStudyRequests(); setMyRequests(r.data); } catch { /* */ }
  }, []);

  const fetchPool = useCallback(async () => {
    setL('pool', true);
    try { const r = await getGrouplessPool(); setPool(r.data); }
    catch { /* */ } finally { setL('pool', false); }
  }, []);

  const fetchMyGroup = useCallback(async () => {
    setL('myGroup', true);
    try {
      const r = await getMyGroup();
      setMyGroup(r.data.group);
      setMyGroupRole(r.data.role);
      if (r.data.group && r.data.role === 'leader') {
        const rr = await getGroupRequests(r.data.group._id);
        setGroupReqs(rr.data);
      }
    } catch { /* */ } finally { setL('myGroup', false); }
  }, []);

  useEffect(() => {
    fetchGroups(); fetchSuggestions(); fetchProfile();
    fetchMyRequests(); fetchPool(); fetchMyGroup();
  }, []);

  useEffect(() => { if (activeTab === 'discover') fetchGroups(); },
    [search, filterSubject, filterStyle, filterStatus]);

  const handleSaveProfile = async () => {
    setA('saveProfile', true);
    try {
      await saveStudyProfile({ ...pf, name: user?.name, email: user?.email });
      notify('Profile saved!');
      setPf({ year: 1, semester: 1, gpa: '', faculty: '', skills: [], workingStyle: 'mixed', availability: {}, deadline: '', sosFlag: false, status: 'lookingForGroup' });
      setSkillInput('');
      setProfileSaved(true);
      fetchSuggestions(); fetchPool();
    } catch (e) { notify(e.response?.data?.message || 'Save failed', true); }
    finally { setA('saveProfile', false); }
  };

  const handleJoinRequest = async (groupId) => {
    setA(groupId, true);
    try {
      await sendJoinRequest(groupId, { studentName: user?.name, studentEmail: user?.email });
      notify('Join request sent!'); fetchMyRequests();
    } catch (e) { notify(e.response?.data?.message || 'Failed', true); }
    finally { setA(groupId, false); }
  };

  const handleUpdateRequest = async (requestId, status) => {
    setA(requestId, true);
    try {
      await updateJoinRequest(requestId, { status });
      notify(`Request ${status}!`); fetchMyRequests(); fetchMyGroup();
    } catch (e) { notify(e.response?.data?.message || 'Failed', true); }
    finally { setA(requestId, false); }
  };

  const handleLeaderAction = async (requestId, status) => {
    setA(requestId, true);
    try {
      await updateJoinRequest(requestId, { status });
      notify(`Student ${status}!`);
      fetchMyGroup();
      if (myGroup) { const r = await getGroupRequests(myGroup._id); setGroupReqs(r.data); }
    } catch (e) { notify(e.response?.data?.message || 'Failed', true); }
    finally { setA(requestId, false); }
  };

  const handleInvite = async (studentId) => {
    if (!myGroup) return notify('You need to be a leader to invite', true);
    const k = `inv_${studentId}`;
    setA(k, true);
    try { await sendGroupInvite(myGroup._id, studentId, {}); notify('Invite sent!'); }
    catch (e) { notify(e.response?.data?.message || 'Failed', true); }
    finally { setA(k, false); }
  };

  const handleToggleStatus = async () => {
    try { await toggleGroupStatus(myGroup._id); fetchMyGroup(); }
    catch (e) { notify(e.response?.data?.message || 'Failed', true); }
  };

  const handleUpdateSkillsNeeded = async () => {
    try {
      await updateSkillsNeeded(myGroup._id, { skillsNeeded: skillsNeededInput });
      notify('Skills needed updated!'); fetchMyGroup(); fetchGroups();
    } catch (e) { notify(e.response?.data?.message || 'Failed', true); }
  };

  const openEditGroup = () => {
    setEditGroup({
      name:          myGroup.name || '',
      groupNumber:   myGroup.groupNumber || '',
      subject:       myGroup.subject || '',
      description:   myGroup.description || '',
      requiredSkills: myGroup.requiredSkills || [],
      workingStyle:  myGroup.workingStyle || 'mixed',
      maxSize:       myGroup.maxSize || 5,
      deadline:      myGroup.deadline ? myGroup.deadline.split('T')[0] : '',
    });
    setEditSkillInput('');
    setEditingGroup(true);
  };

  const handleSaveEditGroup = async () => {
    setA('editGroup', true);
    try {
      await updateStudyGroup(myGroup._id, editGroup);
      notify('Group updated!');
      setEditingGroup(false);
      fetchMyGroup(); fetchGroups();
    } catch (e) { notify(e.response?.data?.message || 'Update failed', true); }
    finally { setA('editGroup', false); }
  };

  const addEditSkill = () => {
    const s = editSkillInput.trim();
    if (s && !editGroup.requiredSkills.includes(s)) {
      setEditGroup(p => ({ ...p, requiredSkills: [...p.requiredSkills, s] }));
    }
    setEditSkillInput('');
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setA('createGroup', true);
    try {
      await createStudyGroup({ ...newGroup, leaderName: user?.name });
      notify('Group created! You are now the leader.');
      setNewGroup({ name: '', subject: '', description: '', requiredSkills: [], workingStyle: 'mixed', maxSize: 5, deadline: '' });
      fetchGroups(); fetchMyGroup(); setActiveTab('myGroup');
    } catch (err) { notify(err.response?.data?.message || 'Failed to create group', true); }
    finally { setA('createGroup', false); }
  };

  const addNewSkill = () => {
    const s = newSkillInput.trim();
    if (s && !newGroup.requiredSkills.includes(s)) setNewGroup(p => ({ ...p, requiredSkills: [...p.requiredSkills, s] }));
    setNewSkillInput('');
  };
  const removeNewSkill = (s) => setNewGroup(p => ({ ...p, requiredSkills: p.requiredSkills.filter(x => x !== s) }));

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !pf.skills.includes(s)) setPf(p => ({ ...p, skills: [...p.skills, s] }));
    setSkillInput('');
  };
  const removeSkill = (s) => setPf(p => ({ ...p, skills: p.skills.filter(x => x !== s) }));
  const toggleAvail = (day, slot) => setPf(p => {
    const cur = p.availability[day] || [];
    return { ...p, availability: { ...p.availability, [day]: cur.includes(slot) ? cur.filter(x => x !== slot) : [...cur, slot] } };
  });

  /* ── Group Card ── */
  const GroupCard = ({ g, isSuggestion = false }) => {
    const myId = uid(user);
    const hasPending = myRequests.some(r => r.groupId?._id === g._id && r.status === 'pending' && r.direction === 'student-to-group');
    const isLeader = g.leader === myId;
    const isMember = (g.members || []).some(m => m.userId === myId);
    const alreadyInAGroup = !!myGroup;
    const profileComplete = profileSaved;
    const memberCount = (g.members || []).length;
    const spotsLeft = g.maxSize - memberCount;
    return (
      <div className={`bg-white rounded-2xl border-2 ${isSuggestion ? 'border-emerald-200' : 'border-slate-100'} shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden w-full`}>

        {/* Top colour bar */}
        <div className={`h-1.5 w-full ${g.status === 'open' ? 'bg-emerald-400' : 'bg-red-300'}`} />

        <div className="p-5 flex flex-col flex-1">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-900 text-base truncate">{g.name}</h3>
                {g.groupNumber && (
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">#{g.groupNumber}</span>
                )}
              </div>
              {g.subject && (
                <span className="inline-block mt-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">{g.subject}</span>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${g.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                {g.status === 'open' ? 'Open' : 'Closed'}
              </span>
              {isSuggestion && g.compatibility !== undefined && (
                <span className="text-xs font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full">{g.compatibility}% match</span>
              )}
            </div>
          </div>

          {/* Description */}
          {g.description && (
            <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">{g.description}</p>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-slate-400 mb-0.5">Members</p>
              <p className="text-sm font-extrabold text-slate-700">{memberCount}<span className="text-xs font-medium text-slate-400">/{g.maxSize}</span></p>
            </div>
            <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-slate-400 mb-0.5">Spots Left</p>
              <p className={`text-sm font-extrabold ${spotsLeft === 0 ? 'text-red-500' : spotsLeft <= 2 ? 'text-orange-500' : 'text-emerald-600'}`}>{spotsLeft}</p>
            </div>
            <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
              <p className="text-xs text-slate-400 mb-0.5">Style</p>
              <p className="text-xs font-bold text-slate-700 capitalize truncate">{g.workingStyle || '—'}</p>
            </div>
          </div>

          {/* Deadline */}
          {g.deadline && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2 mb-4">
              <span>📅</span>
              <span>Deadline: <span className="font-semibold text-slate-700">{new Date(g.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span></span>
            </div>
          )}

          {/* Required skills */}
          {(g.requiredSkills || []).length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Required Skills</p>
              <div className="flex flex-wrap gap-1">
                {g.requiredSkills.slice(0, 5).map(sk => (
                  <span key={sk} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">{sk}</span>
                ))}
                {g.requiredSkills.length > 5 && (
                  <span className="text-xs bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">+{g.requiredSkills.length - 5} more</span>
                )}
              </div>
            </div>
          )}

          {/* Skills needed banner */}
          {g.skillsNeeded && (
            <div className="text-xs bg-orange-50 text-orange-700 border border-orange-100 rounded-xl px-3 py-2 mb-4">
              🔧 Currently needs: <span className="font-semibold">{g.skillsNeeded}</span>
            </div>
          )}

          {/* Action */}
          <div className="mt-auto">
            {!isLeader && !isMember && g.status === 'open' && !alreadyInAGroup && (
              profileComplete ? (
                <button onClick={() => handleJoinRequest(g._id)} disabled={hasPending || actLoad[g._id]}
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-all">
                  {actLoad[g._id] ? 'Sending...' : hasPending ? '✓ Request Sent' : 'Request to Join'}
                </button>
              ) : (
                <button onClick={() => setActiveTab('profile')}
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all">
                  Complete your profile first
                </button>
              )
            )}
            {isLeader && (
              <p className="text-center text-xs font-bold text-red-500">You are the leader</p>
            )}
            {isMember && !isLeader && (
              <p className="text-center text-xs font-bold text-emerald-600">✓ You are a member</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ── Availability Grid ── */
  const SLOT_META = { morning: { label: 'Morning' }, afternoon: { label: 'Afternoon' }, evening: { label: 'Night' } };
  const totalSelected = Object.values(pf.availability).reduce((acc, slots) => acc + (slots?.length || 0), 0);
  const AvailGrid = () => (
    <div className="space-y-3">
      <div className="flex gap-2 flex-1 ml-14 mb-1">
        {SLOTS.map(s => (
          <div key={s} className="flex-1 flex items-center justify-center text-xs text-slate-500">
            <span>{SLOT_META[s].label}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-2">
        {DAYS.map(day => {
          const daySlots = pf.availability[day] || [];
          const allOn = SLOTS.every(s => daySlots.includes(s));
          return (
            <div key={day} className="flex items-center gap-2">
              <button onClick={() => SLOTS.forEach(s => {
                  if (allOn ? true : !daySlots.includes(s)) toggleAvail(day, s);
                })}
                className="w-12 text-xs font-bold text-slate-500 hover:text-slate-700 capitalize text-left shrink-0 transition-colors">
                {day.slice(0,3)}
              </button>
              <div className="flex gap-2 flex-1">
                {SLOTS.map(slot => {
                  const on = daySlots.includes(slot);
                  return (
                    <button key={slot} onClick={() => toggleAvail(day, slot)}
                      className={`flex-1 py-2 rounded-xl transition-all border-2 ${
                        on
                          ? 'bg-slate-100 border-slate-300'
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {totalSelected > 0 && (
        <p className="text-xs font-bold text-emerald-600 text-center mt-1">
          {totalSelected} slot{totalSelected > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );

  /* ── Render ── */
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-slate-900">Study Group Finder</h1>
        <p className="text-slate-500 text-sm mt-1">Find your perfect study group</p>
      </div>

      {success && <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold">✅ {success}</div>}
      {error   && <div className="mb-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold">⚠️ {error}</div>}

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-1 justify-center ${
                activeTab === t.id
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}>
              <span className={`text-base leading-none ${activeTab === t.id ? 'text-emerald-500' : ''}`}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── DISCOVER ─── */}
      {activeTab === 'discover' && (
        <div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3">
            <input type="text" placeholder="Search groups..." value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-44 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
            <input type="text" placeholder="Filter by subject..." value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
              className="w-44 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
            <select value={filterStyle} onChange={e => setFilterStyle(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400">
              <option value="">All styles</option>
              <option value="collaborative">Collaborative</option>
              <option value="independent">Independent</option>
              <option value="mixed">Mixed</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400">
              <option value="open">Open only</option>
              <option value="">All</option>
              <option value="full">Full</option>
            </select>
          </div>

          {suggestions.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-base font-extrabold text-slate-900">Smart Suggestions for You</h2>
                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Ranked by compatibility</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                {suggestions.slice(0, 3).map(g => (
                  <div key={g._id} className="flex">
                    <GroupCard g={g} isSuggestion />
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 my-6" />
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-extrabold text-slate-900">All Groups</h2>
            <span className="text-sm text-slate-400">({groups.length})</span>
          </div>
          {loading.groups ? (
            <div className="text-center py-16 text-slate-300 font-semibold">Loading...</div>
          ) : groups.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <p className="text-slate-400 font-semibold">No groups found</p>
              <p className="text-xs text-slate-300 mt-1">Try adjusting filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {groups.map(g => (
                <div key={g._id} className="flex">
                  <GroupCard g={g} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── CREATE GROUP ─── */}
      {activeTab === 'create' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-extrabold text-slate-900">Create a Study Group</h2>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">You become the leader</span>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Group Name *</label>
                <input type="text" placeholder="e.g. React Study Circle" value={newGroup.name} required
                  onChange={e => setNewGroup(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Group Number</label>
                <input type="text" placeholder="e.g. 03.01, 1.01, 03.02" value={newGroup.groupNumber}
                  onChange={e => setNewGroup(p => ({ ...p, groupNumber: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Subject / Topic *</label>
                <input type="text" placeholder="e.g. Data Structures" value={newGroup.subject} required
                  onChange={e => setNewGroup(p => ({ ...p, subject: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Description</label>
                <textarea placeholder="What is this group about?" value={newGroup.description} rows={3}
                  onChange={e => setNewGroup(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 resize-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Required Skills</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" placeholder="Add a skill..." value={newSkillInput}
                    onChange={e => setNewSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addNewSkill())}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                  <button type="button" onClick={addNewSkill}
                    className="px-3 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600">+</button>
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-8">
                  {newGroup.requiredSkills.length === 0
                    ? <span className="text-xs text-slate-300 italic">No skills added</span>
                    : newGroup.requiredSkills.map(sk => (
                      <span key={sk} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-full font-semibold">
                        {sk}
                        <button type="button" onClick={() => removeNewSkill(sk)} className="text-emerald-300 hover:text-red-500 font-bold">×</button>
                      </span>
                    ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Working Style</label>
                  <div className="flex gap-1">
                    {['collaborative','independent','mixed'].map(s => (
                      <button key={s} type="button" onClick={() => setNewGroup(p => ({ ...p, workingStyle: s }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${newGroup.workingStyle === s ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Max Members</label>
                  <input type="number" min={2} max={20} value={newGroup.maxSize}
                    onChange={e => setNewGroup(p => ({ ...p, maxSize: parseInt(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Assignment Deadline</label>
                <input type="date" value={newGroup.deadline}
                  onChange={e => setNewGroup(p => ({ ...p, deadline: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <button type="submit" disabled={actLoad.createGroup}
                className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 disabled:opacity-50 transition-all">
                {actLoad.createGroup ? 'Creating...' : '✅ Create Study Group'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── PROFILE ─── */}
      {activeTab === 'profile' && (
        <div className="max-w-3xl">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-extrabold text-slate-900">Student Profile</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Academic Year</label>
                  <div className="flex gap-2">
                    {[1,2,3,4].map(y => (
                      <button key={y} onClick={() => setPf(p => ({ ...p, year: y }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${pf.year === y ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        Y{y}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Current Semester</label>
                  <div className="flex gap-2">
                    {[1, 2].map(s => (
                      <button key={s} onClick={() => setPf(p => ({ ...p, semester: s }))}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${pf.semester === s ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        Semester {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Current Semester GPA</label>
                  <input
                    type="number" min="0" max="4" step="0.01"
                    placeholder="e.g. 3.75"
                    value={pf.gpa}
                    onChange={e => setPf(p => ({ ...p, gpa: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400"
                  />
                  <p className="text-xs text-slate-300 mt-1">Scale: 0.00 – 4.00</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Faculty</label>
                  <input type="text" placeholder="e.g. Faculty of Engineering" value={pf.faculty}
                    onChange={e => setPf(p => ({ ...p, faculty: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Working Style</label>
                  <div className="flex gap-2">
                    {['collaborative','independent','mixed'].map(s => (
                      <button key={s} onClick={() => setPf(p => ({ ...p, workingStyle: s }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${pf.workingStyle === s ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Assignment Deadline</label>
                  <input type="date" value={pf.deadline} onChange={e => setPf(p => ({ ...p, deadline: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Status</label>
                  <div className="flex gap-2">
                    {[['lookingForGroup','🔍 Looking'],['notLooking','😌 Not Looking']].map(([val,lbl]) => (
                      <button key={val} onClick={() => setPf(p => ({ ...p, status: val }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${pf.status === val ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setPf(p => ({ ...p, sosFlag: !p.sosFlag }))}
                  className={`w-full text-left rounded-xl px-4 py-3 border-2 transition-all ${pf.sosFlag ? 'bg-orange-50 border-orange-400' : 'bg-slate-50 border-slate-200 hover:border-orange-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl ${pf.sosFlag ? 'animate-pulse' : 'opacity-40'}`}>🆘</span>
                      <div>
                        <p className={`text-sm font-bold ${pf.sosFlag ? 'text-orange-700' : 'text-slate-500'}`}>
                          Urgently Looking for a Group
                        </p>
                        <p className={`text-xs ${pf.sosFlag ? 'text-orange-500' : 'text-slate-400'}`}>
                          Highlights your profile and moves you to the top of the student pool
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${pf.sosFlag ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {pf.sosFlag ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input type="text" placeholder="Add a skill..." value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                    <button onClick={addSkill} className="px-3 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600">+</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 min-h-8">
                    {pf.skills.length === 0
                      ? <span className="text-xs text-slate-300 italic">No skills added</span>
                      : pf.skills.map(sk => (
                        <span key={sk} className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-full font-semibold">
                          {sk}
                          <button onClick={() => removeSkill(sk)} className="text-emerald-300 hover:text-red-500 font-bold">×</button>
                        </span>
                      ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-3">Weekly Availability</label>
                  <AvailGrid />
                </div>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-slate-100">
              <button onClick={handleSaveProfile} disabled={actLoad.saveProfile}
                className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 disabled:opacity-50 transition-all">
                {actLoad.saveProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── REQUESTS ─── */}
      {activeTab === 'requests' && (
        <div className="space-y-6 max-w-3xl">
          {[
            { dir: 'student-to-group', label: 'Sent Requests',   empty: 'No sent requests yet' },
            { dir: 'group-to-student', label: 'Received Invites', empty: 'No invites yet' },
          ].map(({ dir, label, empty }) => {
            const items = myRequests.filter(r => r.direction === dir);
            return (
              <div key={dir}>
                <h2 className="text-base font-extrabold text-slate-900 mb-3">
                  {label} <span className="text-slate-400 font-semibold text-sm">({items.length})</span>
                </h2>
                {items.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400 text-sm">{empty}</div>
                ) : (
                  <div className="space-y-3">
                    {items.map(req => (
                      <div key={req._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm">{req.groupId?.name || 'Group'}</p>
                          <p className="text-xs text-slate-400">{req.groupId?.subject}</p>
                          {req.message && <p className="text-xs text-slate-500 italic mt-1">"{req.message}"</p>}
                          <p className="text-xs text-slate-300 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_BADGE[req.status]}`}>{req.status}</span>
                          {req.status === 'pending' && dir === 'student-to-group' && (
                            <button onClick={() => handleUpdateRequest(req._id, 'withdrawn')} disabled={actLoad[req._id]}
                              className="text-xs text-red-500 hover:text-red-700 font-bold">Withdraw</button>
                          )}
                          {req.status === 'pending' && dir === 'group-to-student' && (
                            <>
                              <button onClick={() => handleUpdateRequest(req._id, 'accepted')} disabled={actLoad[req._id]}
                                className="text-xs bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-600">Accept</button>
                              <button onClick={() => handleUpdateRequest(req._id, 'declined')} disabled={actLoad[req._id]}
                                className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-lg font-bold hover:bg-red-100">Decline</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── POOL ─── */}
      {activeTab === 'pool' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-base font-extrabold text-slate-900">Groupless Student Pool</h2>
            <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{pool.length} looking</span>
            {myGroupRole === 'leader' && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Leader — invite students</span>
            )}
          </div>
          {loading.pool ? (
            <div className="text-center py-16 text-slate-300 font-semibold">Loading pool...</div>
          ) : pool.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <p className="text-slate-400 font-semibold">No students in the pool</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pool.map(student => (
                <div key={student._id} className={`bg-white rounded-2xl border ${student.sosFlag ? 'border-orange-200' : 'border-slate-100'} shadow-sm p-5 flex flex-col`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-extrabold text-sm">
                        {(student.name || 'S')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{student.name || 'Anonymous'}</p>
                        <p className="text-xs text-slate-400">{student.email || ''}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                    </div>
                  </div>

                  {/* Academic info — always visible */}
                  <div className="flex flex-wrap gap-2 text-xs mb-3">
                    {student.year    && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Year {student.year}</span>}
                    {student.semester && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Sem {student.semester}</span>}
                    {student.gpa != null && student.gpa !== '' && <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">GPA {student.gpa}</span>}
                    {student.faculty && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{student.faculty}</span>}
                    {student.workingStyle && <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{student.workingStyle}</span>}
                    {student.deadline && <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full">Due {new Date(student.deadline).toLocaleDateString()}</span>}
                  </div>

                  {/* Skills */}
                  {(student.skills || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(myGroupRole === 'leader' ? student.skills : (student.skills || []).slice(0,5)).map(sk => (
                        <span key={sk} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{sk}</span>
                      ))}
                    </div>
                  )}

                  {/* Availability — leaders only */}
                  {myGroupRole === 'leader' && student.availability && Object.keys(student.availability).length > 0 && (
                    <div className="mb-3 bg-slate-50 rounded-xl p-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Availability</p>
                      <div className="space-y-1">
                        {DAYS.filter(d => student.availability[d]?.length > 0).map(d => (
                          <div key={d} className="flex items-center gap-2 text-xs">
                            <span className="w-8 font-semibold text-slate-500 capitalize">{d.slice(0,3)}</span>
                            <div className="flex gap-1">
                              {(student.availability[d] || []).map(slot => (
                                <span key={slot} className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full capitalize">{slot}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {myGroupRole === 'leader' && myGroup?.status === 'open' && student.userId !== uid(user) && (
                    <button onClick={() => handleInvite(student.userId)} disabled={actLoad[`inv_${student.userId}`]}
                      className="mt-auto w-full py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 disabled:opacity-50 transition-all">
                      {actLoad[`inv_${student.userId}`] ? '...' : 'Invite to My Group'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── MY GROUP ─── */}
      {activeTab === 'myGroup' && (
        <div className="max-w-3xl space-y-4">
          {loading.myGroup ? (
            <div className="text-center py-16 text-slate-300 font-semibold">Loading...</div>
          ) : !myGroup ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-bold text-slate-700 mb-1">You're not in a group yet</p>
              <p className="text-sm text-slate-400 mb-5">Browse groups or set up your profile for AI suggestions</p>
              <button onClick={() => setActiveTab('discover')}
                className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600">
                Discover Groups
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">{myGroup.name}</h2>
                    {myGroup.subject && <p className="text-emerald-600 font-semibold text-sm mt-0.5">{myGroup.subject}</p>}
                    {myGroup.description && <p className="text-slate-500 text-sm mt-2">{myGroup.description}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${myGroup.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{myGroup.status}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${myGroupRole === 'leader' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      {myGroupRole === 'leader' ? 'Group Leader' : 'Member'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                  <span>👥 {myGroup.members?.length}/{myGroup.maxSize}</span>
                  <span>🧠 {myGroup.workingStyle}</span>
                  {myGroup.deadline && <span>📅 {new Date(myGroup.deadline).toLocaleDateString()}</span>}
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {(myGroup.requiredSkills || []).map(sk => (
                    <span key={sk} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{sk}</span>
                  ))}
                </div>
                {myGroupRole === 'leader' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                    <button onClick={handleToggleStatus}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${myGroup.status === 'open' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                      {myGroup.status === 'open' ? '🔒 Set Full' : '🔓 Set Open'}
                    </button>
                    <button onClick={openEditGroup}
                      className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all">
                      Edit Group
                    </button>
                    <div className="flex gap-2 flex-1 min-w-44">
                      <input type="text" placeholder="Post skills needed..." value={skillsNeededInput}
                        onChange={e => setSkillsNeededInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleUpdateSkillsNeeded()}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                      <button onClick={handleUpdateSkillsNeeded}
                        className="px-3 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600">Post</button>
                    </div>
                  </div>
                )}

                {/* Edit Group Form */}
                {editingGroup && myGroupRole === 'leader' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-sm">Edit Group Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Group Name</label>
                        <input type="text" value={editGroup.name} onChange={e => setEditGroup(p => ({ ...p, name: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Group Number</label>
                        <input type="text" value={editGroup.groupNumber} onChange={e => setEditGroup(p => ({ ...p, groupNumber: e.target.value }))}
                          placeholder="e.g. 03.01" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Subject</label>
                        <input type="text" value={editGroup.subject} onChange={e => setEditGroup(p => ({ ...p, subject: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Working Style</label>
                        <select value={editGroup.workingStyle} onChange={e => setEditGroup(p => ({ ...p, workingStyle: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400">
                          <option value="collaborative">Collaborative</option>
                          <option value="independent">Independent</option>
                          <option value="mixed">Mixed</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Max Size</label>
                        <input type="number" min={myGroup.members?.length || 1} max={20} value={editGroup.maxSize}
                          onChange={e => setEditGroup(p => ({ ...p, maxSize: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Deadline</label>
                        <input type="date" value={editGroup.deadline} onChange={e => setEditGroup(p => ({ ...p, deadline: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Description</label>
                      <textarea rows={2} value={editGroup.description} onChange={e => setEditGroup(p => ({ ...p, description: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 resize-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Required Skills</label>
                      <div className="flex gap-2 mb-2">
                        <input type="text" placeholder="Add skill..." value={editSkillInput}
                          onChange={e => setEditSkillInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addEditSkill())}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
                        <button onClick={addEditSkill} className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-300">Add</button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {editGroup.requiredSkills?.map(sk => (
                          <span key={sk} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            {sk}
                            <button onClick={() => setEditGroup(p => ({ ...p, requiredSkills: p.requiredSkills.filter(x => x !== sk) }))} className="text-blue-400 hover:text-red-500 font-bold">×</button>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button onClick={() => setEditingGroup(false)}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200">Cancel</button>
                      <button onClick={handleSaveEditGroup} disabled={actLoad.editGroup}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50">
                        {actLoad.editGroup ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-extrabold text-slate-900 mb-3">Members ({myGroup.members?.length})</h3>
                <div className="space-y-2">
                  {(myGroup.members || []).map(m => (
                    <div key={m.userId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
                      <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">
                        {(m.name || 'M')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                        {m.userId === myGroup.leader && <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block">Group Leader</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {myGroupRole === 'leader' && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-extrabold text-slate-900">Join Requests</h3>
                    {groupReqs.filter(r => r.status === 'pending').length > 0 && (
                      <span className="text-xs bg-orange-500 text-white rounded-full px-2 py-0.5 font-bold">
                        {groupReqs.filter(r => r.status === 'pending').length} new
                      </span>
                    )}
                  </div>
                  {groupReqs.length === 0 ? (
                    <p className="text-sm text-slate-400">No join requests yet</p>
                  ) : (
                    <div className="space-y-4">
                      {groupReqs.map(req => {
                        const sp = req.studentProfile;
                        return (
                          <div key={req._id} className={`rounded-2xl border-2 overflow-hidden ${req.status === 'pending' ? 'border-slate-200' : 'border-slate-100'}`}>

                            {/* Colour bar by status */}
                            <div className={`h-1 w-full ${req.status === 'pending' ? 'bg-orange-400' : req.status === 'accepted' ? 'bg-emerald-400' : req.status === 'declined' ? 'bg-red-300' : 'bg-blue-300'}`} />

                            <div className="p-4">
                              {/* Header */}
                              <div className="flex items-center justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-extrabold text-base shrink-0">
                                    {(req.studentName || 'S')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-slate-800">{req.studentName || 'Student'}</p>
                                    <p className="text-xs text-slate-400">{req.studentEmail}</p>
                                    <p className="text-xs text-slate-300 mt-0.5">Applied {new Date(req.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                  </div>
                                </div>
                                {req.status !== 'pending' ? (
                                  <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${STATUS_BADGE[req.status]}`}>{req.status}</span>
                                ) : (
                                  <div className="flex gap-2 shrink-0">
                                    <button onClick={() => handleLeaderAction(req._id, 'accepted')} disabled={actLoad[req._id]}
                                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-all">Accept</button>
                                    <button onClick={() => handleLeaderAction(req._id, 'waitlisted')} disabled={actLoad[req._id]}
                                      className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 transition-all">Waitlist</button>
                                    <button onClick={() => handleLeaderAction(req._id, 'declined')} disabled={actLoad[req._id]}
                                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50 transition-all">Decline</button>
                                  </div>
                                )}
                              </div>

                              {/* Academic info grid */}
                              {sp && (
                                <>
                                  <div className="grid grid-cols-3 gap-2 mb-3">
                                    {sp.year && (
                                      <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
                                        <p className="text-xs text-slate-400 mb-0.5">Year</p>
                                        <p className="text-sm font-extrabold text-slate-700">{sp.year}</p>
                                      </div>
                                    )}
                                    {sp.semester && (
                                      <div className="bg-slate-50 rounded-xl px-3 py-2 text-center">
                                        <p className="text-xs text-slate-400 mb-0.5">Semester</p>
                                        <p className="text-sm font-extrabold text-slate-700">{sp.semester}</p>
                                      </div>
                                    )}
                                    {sp.gpa != null && sp.gpa !== '' && (
                                      <div className="bg-emerald-50 rounded-xl px-3 py-2 text-center">
                                        <p className="text-xs text-emerald-400 mb-0.5">GPA</p>
                                        <p className="text-sm font-extrabold text-emerald-700">{sp.gpa}</p>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap gap-2 mb-3 text-xs">
                                    {sp.faculty && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-semibold">{sp.faculty}</span>}
                                    {sp.workingStyle && <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-semibold capitalize">{sp.workingStyle}</span>}
                                    {sp.deadline && <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full">Due {new Date(sp.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                                  </div>

                                  {sp.skills?.length > 0 && (
                                    <div>
                                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Skills</p>
                                      <div className="flex flex-wrap gap-1">
                                        {sp.skills.map(sk => (
                                          <span key={sk} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{sk}</span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                              {!sp && <p className="text-xs text-slate-300 italic">No profile set up</p>}

                              {req.message && (
                                <div className="mt-3 bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-500 italic border border-slate-100">
                                  "{req.message}"
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

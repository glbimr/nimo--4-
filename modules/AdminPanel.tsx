import React, { useState } from 'react';
import { useApp } from '../store';
import { UserRole, User, ProjectAccessLevel } from '../types';
import { Trash2, UserPlus, Shield, User as UserIcon, Settings, Lock, Search, KeyRound, LayoutGrid } from 'lucide-react';
import { Modal } from '../components/Modal';

export const AdminPanel: React.FC = () => {
  const { users, projects, addUser, updateUser, deleteUser, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'account' | 'permissions'>('account');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: UserRole.MEMBER,
    projectAccess: {} as Record<string, ProjectAccessLevel>
  });

  if (currentUser?.role !== UserRole.ADMIN) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        Access Denied. Admin privileges required.
      </div>
    );
  }

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      role: UserRole.MEMBER,
      projectAccess: projects.reduce((acc, p) => ({ ...acc, [p.id]: 'read' }), {})
    });
    setActiveTab('account');
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    // Ensure all projects have an entry, defaulting to 'none' if missing
    const access = { ...user.projectAccess };
    projects.forEach(p => {
      if (!access[p.id]) access[p.id] = 'none';
    });

    setFormData({
      name: user.name,
      username: user.username,
      password: user.password,
      role: user.role,
      projectAccess: access
    });
    setActiveTab('account');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) return;

    if (editingUser) {
      updateUser({
        ...editingUser,
        name: formData.name,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        projectAccess: formData.projectAccess
      });
    } else {
      addUser({
        id: crypto.randomUUID(),
        name: formData.name,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${formData.username}`,
        projectAccess: formData.projectAccess,
        isOnline: false
      });
    }
    setIsModalOpen(false);
  };

  const handleAccessChange = (projectId: string, level: ProjectAccessLevel) => {
    setFormData(prev => ({
      ...prev,
      projectAccess: { ...prev.projectAccess, [projectId]: level }
    }));
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full p-4 md:p-6 pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 truncate">User Management</h1>
        
        <div className="flex w-full md:w-auto space-x-2">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <button
            onClick={openAddModal}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-colors shadow-sm shrink-0"
            >
            <UserPlus size={18} className="mr-0 md:mr-2" /> 
            <span className="hidden md:inline">Add User</span>
            <span className="md:hidden">Add</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden w-full">
        <div className="w-full">
          <table className="w-full text-left text-sm table-fixed md:table-auto">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-3 py-3 md:px-6 md:py-4 font-semibold text-slate-700 w-[45%] md:w-auto">User</th>
                <th className="hidden md:table-cell px-6 py-4 font-semibold text-slate-700">Username</th>
                <th className="px-3 py-3 md:px-6 md:py-4 font-semibold text-slate-700 w-[25%] md:w-auto">Role</th>
                <th className="px-3 py-3 md:px-6 md:py-4 font-semibold text-slate-700 text-right w-[30%] md:w-auto">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-3 md:px-6 md:py-4 overflow-hidden">
                    <div className="flex items-center">
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full mr-2 md:mr-3 border border-slate-200 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 truncate">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 text-slate-500 font-mono text-xs">{user.username}</td>
                  <td className="px-3 py-3 md:px-6 md:py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium ${
                      user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === UserRole.ADMIN ? <Shield size={10} className="mr-1"/> : <UserIcon size={10} className="mr-1"/>}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-3 py-3 md:px-6 md:py-4 text-right">
                    <div className="flex justify-end space-x-1">
                       <button
                          onClick={() => openEditModal(user)}
                          className="text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded transition-colors"
                          title="Settings"
                        >
                          <Settings size={18} />
                        </button>
                      {user.id !== currentUser.id && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                  <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                          {searchTerm ? `No users found matching "${searchTerm}"` : 'No users found'}
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingUser ? "Edit User Settings" : "Create New User"}
        maxWidth="max-w-2xl"
        className="h-auto"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full px-6 pb-6">
           {/* Custom Tabs */}
           <div className="flex border-b border-slate-100 mb-6 -mx-6 px-6">
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'account' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                 Account Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('permissions')}
                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'permissions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                 Project Access
              </button>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar">
              {activeTab === 'account' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-200 py-1">
                   {/* Name Field */}
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                      <div className="relative">
                         <UserIcon size={18} className="absolute left-3 top-3 text-slate-400" />
                         <input
                           required
                           type="text"
                           className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                           value={formData.name}
                           onChange={e => setFormData({...formData, name: e.target.value})}
                           placeholder="John Doe"
                         />
                      </div>
                   </div>

                   {/* Username & Role Row */}
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Username</label>
                        <input
                          required
                          type="text"
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-slate-50 focus:bg-white"
                          value={formData.username}
                          onChange={e => setFormData({...formData, username: e.target.value})}
                          placeholder="johndoe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Role</label>
                        <div className="relative">
                            <select
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-slate-50 focus:bg-white appearance-none cursor-pointer"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                            >
                            <option value={UserRole.MEMBER}>Member</option>
                            <option value={UserRole.ADMIN}>Administrator</option>
                            </select>
                            <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                                <Shield size={14} />
                            </div>
                        </div>
                      </div>
                   </div>

                   {/* Password Field */}
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
                      <div className="relative">
                         <KeyRound size={18} className="absolute left-3 top-3 text-slate-400" />
                         <input
                           required
                           type="text"
                           className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all bg-slate-50 focus:bg-white font-mono tracking-wide"
                           value={formData.password}
                           onChange={e => setFormData({...formData, password: e.target.value})}
                           placeholder="Secret123"
                         />
                         <div className="absolute right-3 top-3.5">
                            <Lock size={16} className="text-slate-300" />
                         </div>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Password must be at least 6 characters long.</p>
                   </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200 py-1">
                   <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-slate-800">Project Permissions</h4>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                        {projects.length} Projects
                      </span>
                   </div>
                   
                   <div className="space-y-3">
                      {projects.map(project => (
                        <div key={project.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-colors border border-slate-100 rounded-xl bg-white shadow-sm">
                           <div className="flex items-center min-w-0 mr-4">
                              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mr-3 shrink-0 border border-indigo-100">
                                 <LayoutGrid size={18} />
                              </div>
                              <div className="truncate">
                                 <div className="text-sm font-bold text-slate-800 truncate mb-0.5">{project.name}</div>
                                 <div className="text-[10px] text-slate-400 font-mono">ID: {project.id}</div>
                              </div>
                           </div>
                           
                           <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
                              {(['none', 'read', 'write'] as ProjectAccessLevel[]).map((level) => (
                                <button
                                  key={level}
                                  type="button"
                                  onClick={() => handleAccessChange(project.id, level)}
                                  className={`px-3 py-1.5 text-[10px] font-bold rounded-md capitalize transition-all ${
                                      formData.projectAccess[project.id] === level
                                      ? level === 'none' ? 'bg-white text-slate-600 shadow-sm border border-slate-200' : 
                                        level === 'read' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'bg-white text-green-600 shadow-sm border border-slate-200'
                                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                                  }`}
                                >
                                  {level}
                                </button>
                              ))}
                           </div>
                        </div>
                      ))}
                      {projects.length === 0 && (
                        <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">No projects available to configure.</div>
                      )}
                   </div>
                </div>
              )}
           </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end space-x-3">
             <button
               type="button"
               onClick={() => setIsModalOpen(false)}
               className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-lg text-sm font-medium transition-colors"
             >
               Cancel
             </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm shadow-lg shadow-indigo-200 transition-all transform hover:scale-[1.02]"
            >
              {editingUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
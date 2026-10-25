import React from 'react';

const Avatar = ({ user, name, avatar, size = 'md', className = '' }) => {
  const userName = user?.name || name || 'User';
  const userAvatar = user?.avatar || avatar;

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return str[0].toUpperCase();
  };

  const sizes = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  return (
    <div
      title={userName}
      className={`relative inline-flex items-center justify-center rounded-full bg-blue-600 text-white font-bold overflow-hidden shadow-xs border border-white shrink-0 ${sizes[size]} ${className}`}
    >
      {userAvatar ? (
        <img
          src={userAvatar}
          alt={userName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <span>{getInitials(userName)}</span>
      )}
    </div>
  );
};

export const AvatarGroup = ({ users = [], max = 4 }) => {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex items-center -space-x-2 overflow-hidden">
      {visible.map((u, i) => (
        <Avatar key={u._id || i} user={u} size="sm" className="ring-2 ring-white" />
      ))}
      {remaining > 0 && (
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-xs font-bold ring-2 ring-white">
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default Avatar;

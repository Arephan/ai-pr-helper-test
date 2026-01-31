import React, { useState, useEffect } from 'react';
import { fetchUserData } from '../utils/api';
import { formatDate } from '../utils/formatters';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  avatar?: string;
}

interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, onUpdate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await fetchUserData(userId);
      setUser(data);
      setError(null);
    } catch (err) {
      setError('Failed to load user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const updated = { ...user, ...updates };
      setUser(updated);
      onUpdate?.(updated);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update user');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!user) return <div className="not-found">User not found</div>;

  return (
    <div className="user-profile">
      <div className="user-avatar">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} />
        ) : (
          <div className="avatar-placeholder">{user.name[0]}</div>
        )}
      </div>
      
      <div className="user-details">
        <h2>{user.name}</h2>
        <p className="user-email">{user.email}</p>
        <p className="user-joined">
          Member since {formatDate(user.createdAt)}
        </p>
      </div>

      {isEditing ? (
        <div className="edit-form">
          {/* Edit form would go here */}
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <button onClick={() => setIsEditing(true)}>Edit Profile</button>
      )}
    </div>
  );
};

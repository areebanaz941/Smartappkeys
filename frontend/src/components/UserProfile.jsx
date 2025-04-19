import React, { useState, useEffect } from 'react';
import config from '../config';
import { useTranslation } from 'react-i18next';

const UserProfile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });

  // Add useTranslation hook
  const { t } = useTranslation();

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const fetchUrl = config.getApiUrl('users/me');        // GET endpoint
  const updateUrl = config.getApiUrl('users/profile');  // PATCH endpoint

  useEffect(() => {
    const loadUserFromLocalStorage = () => {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          setProfile((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.warn('Failed to parse user data from localStorage');
        }
      }
    };

    const fetchUserFromAPI = async () => {
      try {
        const res = await fetch(fetchUrl, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();

        if (res.ok && data.user) {
          setProfile(data.user);
          localStorage.setItem('userData', JSON.stringify(data.user)); // update cache
        } else {
          setMessage(data.message || 'Failed to load profile');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setMessage('Server error loading profile');
      }
    };

    loadUserFromLocalStorage();
    fetchUserFromAPI();
  }, [fetchUrl, token]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      const result = await res.json();

      if (res.ok && result.user) {
        setProfile(result.user);
        localStorage.setItem('userData', JSON.stringify(result.user));
        setMessage('Profile updated successfully!');
      } else {
        setMessage(result.message || 'Update failed.');
      }
    } catch (err) {
      console.error('Save error:', err);
      setMessage('An error occurred while saving.');
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-md mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">User Profile</h2>

        <input
          type="text"
          name="firstName"
          value={profile.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="text"
          name="lastName"
          value={profile.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          value={profile.email}
          placeholder="Email"
          className="w-full mb-2 p-2 border rounded bg-gray-100 text-gray-500 cursor-not-allowed"
          readOnly
          disabled
        />
        <input
          type="text"
          name="phoneNumber"
          value={profile.phoneNumber}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full mb-4 p-2 border rounded"
        />

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 w-full"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>

        {message && <p className="mt-3 text-sm text-center text-gray-700">{message}</p>}
      </div>
    </div>
  );
};

export default UserProfile;

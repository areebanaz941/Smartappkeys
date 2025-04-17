import React, { useState, useEffect } from 'react';

const API_URL = 'https://api.yoursite.com/api/users'; // Adjust if needed

const UserProfile = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Replace with your actual token logic
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      const result = await res.json();

      if (res.ok) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage(result.message || 'Update failed.');
      }
    } catch (err) {
      setMessage('An error occurred.');
    }
    setLoading(false);
  };

  return (
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
        onChange={handleChange}
        placeholder="Email"
        className="w-full mb-2 p-2 border rounded"
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
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        {loading ? 'Saving...' : 'Save'}
      </button>

      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default UserProfile;

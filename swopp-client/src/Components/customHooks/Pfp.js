import { useState } from 'react';

const usePfp = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const Pfp = async (file, token) => {
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5078/api/user/upload-profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }

      const data = await response.json();
      setUploading(false);
      return data.Pfp;
    } catch (error) {
      setError(error.message);
      setUploading(false);
      throw error;
    }
  };

  return { Pfp, uploading, error };
};

export default usePfp;
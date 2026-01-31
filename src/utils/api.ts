const API_BASE = process.env.REACT_APP_API_BASE || 'https://api.example.com';

export async function fetchUserData(userId: string) {
  const response = await fetch(`${API_BASE}/users/${userId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }
  
  return response.json();
}

export async function updateUserData(userId: string, data: Record<string, any>) {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update user: ${response.statusText}`);
  }
  
  return response.json();
}

export async function deleteUser(userId: string) {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.statusText}`);
  }
  
  return true;
}

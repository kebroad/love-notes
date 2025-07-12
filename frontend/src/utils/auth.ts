// Authentication utility functions

export const getStoredPassword = (): string | null => {
  return localStorage.getItem('loveNotesPassword');
};

export const getStoredUser = (): { username: string; password: string } | null => {
  const user = localStorage.getItem('loveNotesUser');
  const password = localStorage.getItem('loveNotesPassword');
  
  if (!user || !password) {
    return null;
  }
  
  try {
    const parsedUser = JSON.parse(user);
    return {
      username: parsedUser.username,
      password: password,
    };
  } catch (error) {
    return null;
  }
};

export const clearAuthData = (): void => {
  localStorage.removeItem('loveNotesUser');
  localStorage.removeItem('loveNotesPassword');
}; 
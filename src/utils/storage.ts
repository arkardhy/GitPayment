const PREFIX = 'trans_kota_kita_';

export const storage = {
  setAdminToken: (token: string) => {
    localStorage.setItem(`${PREFIX}admin_token`, token);
  },
  
  getAdminToken: () => {
    return localStorage.getItem(`${PREFIX}admin_token`);
  },
  
  clearAdminToken: () => {
    localStorage.removeItem(`${PREFIX}admin_token`);
  },
  
  isAdmin: () => {
    return !!localStorage.getItem(`${PREFIX}admin_token`);
  }
};
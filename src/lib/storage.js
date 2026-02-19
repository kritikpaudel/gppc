const KEY = "mini_ctf_state_v1";

export const loadState = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveState = (state) => {
  localStorage.setItem(KEY, JSON.stringify(state));
};

export const resetState = () => localStorage.removeItem(KEY);

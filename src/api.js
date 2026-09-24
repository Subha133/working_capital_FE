import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const startCycle = async (cycle_date, available_cash_usd, override_dq_halt) => {
  const response = await api.post('/cycles', {
    cycle_date,
    available_cash_usd: parseFloat(available_cash_usd),
    override_dq_halt,
  });
  return response.data;
};

export const getCycle = async (thread_id) => {
  const response = await api.get(`/cycles/${thread_id}`);
  return response.data;
};

export const uploadData = async (file, cycleDate, fileType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('cycle_date', cycleDate);
  formData.append('file_type', fileType);

  const response = await api.post('/data/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const submitApproval = async (thread_id, action_id, decision, edited_cash_usd = null) => {
  const payload = { action_id, decision };
  if (edited_cash_usd !== null) {
    payload.edited_cash_usd = parseFloat(edited_cash_usd);
  }
  const response = await api.post(`/cycles/${thread_id}/approvals`, payload);
  return response.data;
};

export const getCycleSummary = async (cycleDate) => {
  const response = await api.get(`/data/summary/${cycleDate}`);
  return response.data;
};

export const chatWithData = async (cycleDate, question, history) => {
  const response = await api.post('/chat', {
    cycle_date: cycleDate,
    question,
    history
  });
  return response.data;
};

export const getIndexStatus = async (cycleDate) => {
  const response = await api.get(`/chat/index-status/${cycleDate}`);
  return response.data;
};

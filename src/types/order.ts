deleteOldOrders: async (days: number) => {
  const response = await api.delete(`/orders/cleanup?days=${days}`);
  return response.data;
},
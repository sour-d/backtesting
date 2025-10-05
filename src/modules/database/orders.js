
import supabase from "./index.js";

export const createOrder = async (order) => {
  const {
    orderId,
    strategyId,
    price,
    timestamp,
    quantity: qty,
    risk,
    orderType,
    side,
    status,
    stopLoss: stoploss
  } = order;

  const { data, error } = await supabase
    .from('orders')
    .insert([{
      orderId,
      strategyId,
      price,
      timestamp,
      qty,
      risk,
      orderType,
      side,
      status,
      stoploss
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating order: ${error.message}`);
  }

  return data;
};

export const updateOrderStatus = async (orderId, status) => {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status,
      updatedAt: new Date().toISOString()
    })
    .eq('orderId', orderId)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating order status: ${error.message}`);
  }

  return data;
};

export const getOrderByOrderId = async (orderId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('orderId', orderId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    throw new Error(`Error getting order: ${error.message}`);
  }

  return data;
};

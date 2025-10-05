import supabase from "./index.js";

/**
 * Create a new strategy in the database
 * @param {Object} strategy - Strategy object with id, strategyName, stockName, timeFrame, config, and state
 * @returns {Promise<Object>} The created strategy record
 */
export const createStrategy = async (strategy) => {
  const { id, strategyName, stockName, timeFrame, config, state } = strategy;

  const { data, error } = await supabase
    .from('strategies')
    .insert([{
      id,
      strategyName,
      stockName,
      timeFrame,
      config,
      state
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating strategy: ${error.message}`);
  }

  return data;
};

/**
 * Update the state of a strategy
 * @param {string} id - The UUID of the strategy to update
 * @param {Object} state - The new state object
 * @returns {Promise<Object>} The updated strategy record
 */
export const updateStrategyState = async (id, state) => {
  const { data, error } = await supabase
    .from('strategies')
    .update({
      state,
      updatedAt: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating strategy state: ${error.message}`);
  }

  return data;
};

/**
 * Get all strategies from the database
 * @returns {Promise<Array>} Array of strategy records
 */
export const getAllStrategies = async () => {
  const { data, error } = await supabase
    .from('strategies')
    .select('*');

  if (error) {
    throw new Error(`Error getting all strategies: ${error.message}`);
  }

  return data;
};

/**
 * Get a strategy by its ID
 * @param {string} id - The UUID of the strategy to retrieve
 * @returns {Promise<Object|null>} The strategy record or null if not found
 */
export const getStrategyById = async (id) => {
  const { data, error } = await supabase
    .from('strategies')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    throw new Error(`Error getting strategy by ID: ${error.message}`);
  }

  return data;
};

/**
 * Get strategies by name
 * @param {string} strategyName - The name of the strategy to retrieve
 * @returns {Promise<Array>} Array of matching strategy records
 */
export const getStrategiesByName = async (strategyName) => {
  const { data, error } = await supabase
    .from('strategies')
    .select('*')
    .eq('strategyName', strategyName);

  if (error) {
    throw new Error(`Error getting strategies by name: ${error.message}`);
  }

  return data;
};

/**
 * Get a specific strategy by name, stock, and timeframe
 * @param {string} strategyName - The strategy name
 * @param {string} stockName - The stock name
 * @param {string} timeFrame - The time frame
 * @returns {Promise<Object|null>} The strategy record or null if not found
 */
export const getSpecificStrategy = async (strategyName, stockName, timeFrame) => {
  const { data, error } = await supabase
    .from('strategies')
    .select('*')
    .eq('strategyName', strategyName)
    .eq('stockName', stockName)
    .eq('timeFrame', timeFrame)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    throw new Error(`Error getting specific strategy: ${error.message}`);
  }

  return data;
};

/**
 * Delete a strategy by its ID
 * @param {string} id - The UUID of the strategy to delete
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export const deleteStrategy = async (id) => {
  const { data, error } = await supabase
    .from('strategies')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    throw new Error(`Error deleting strategy: ${error.message}`);
  }

  return data && data.length > 0;
};

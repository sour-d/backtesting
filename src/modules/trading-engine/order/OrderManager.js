import { createTrade } from "../../database/trades.js";
import broker from "../../exchange/index.js";
import { createOrder as storeOrderDetails } from "../../database/orders.js";

/**
 * Helper function to round a value to a specific size
 * @param {number} value - The value to round
 * @param {number} size - The size to round to
 * @returns {number} The rounded value
 */
function roundLikeSize(value, size = 0.00001) {
  size = Number(size);
  return removeExtraZeroInFloat(value - removeExtraZeroInFloat(value % size));
}

/**
 * Helper function to remove extra zeros in a float
 * @param {number} float - The float to remove extra zeros from
 * @returns {number} The float without extra zeros
 */
function removeExtraZeroInFloat(float) {
  return Number(float.toFixed(8));
}

/**
 * OrderManager class to handle order placement and management
 */
class OrderManager {
  /**
   * Constructor for the OrderManager class
   * @param {Function} logger - Logger function
   * @param {Object} positionManager - Position manager instance
   * @param {Object} riskManager - Risk manager instance
   * @param {Object} quoteStorage - Quote storage instance
   * @param {Object} state - Optional state to restore from persistence
   */
  constructor(logger, positionManager, riskManager, quoteStorage, state = {}) {
    this.logger = logger;
    this.broker = new broker.Trade(this.stockName, this.logger);
    this.positionManager = positionManager;
    this.riskManager = riskManager;
    this.quoteStorage = quoteStorage;
  }

  /**
   * Convert the order manager to JSON for persistence
   * @returns {Object} JSON representation of the order manager
   */
  toJSON() {
    return {};
  }

  /**
   * Place an order
   * @param {number} risk - Risk per stock
   * @param {number} price - Price to buy/sell at
   * @param {number} tpPrice - Take profit price
   * @param {string} side - Buy or Sell
   * @param {boolean} isLimitOrder - Whether to place a limit order
   * @returns {Promise<boolean>} True if the order was placed successfully
   */
  async placeOrder(risk, price, tpPrice, side = "Buy", isLimitOrder = false) {
    if (await this.isLastOrderFilled()) return;
    await this.riskManager.updateCapital();

    const symbolInfo = this.positionManager.getSymbolInfo();
    price = roundLikeSize(price, symbolInfo?.priceFilter?.tickSize);
    tpPrice = roundLikeSize(tpPrice, symbolInfo?.priceFilter?.tickSize);

    const currentPosition = this.positionManager.getCurrentPosition();
    if (currentPosition) {
      const { price: pastPrice, risk: pastRisk } = currentPosition;
      if (pastPrice === price && pastRisk === risk) return;
      this.cancelLastOrder();
      this.positionManager.clearPosition();
    }

    let stopLoss = side === "Buy" ? price - risk : price + risk;
    stopLoss = roundLikeSize(stopLoss, symbolInfo?.priceFilter?.tickSize);

    let quantity = this.riskManager.stocksCanBeBought(risk, price);
    quantity = roundLikeSize(quantity, symbolInfo?.lotSizeFilter?.qtyStep);

    const limitPrice = isLimitOrder ? price : 0;
    this.logger.info("Placing Order", {
      quantity,
      limitPrice,
      tpPrice,
      stopLoss,
      side,
      isLimitOrder,
    });
    return await this.broker
      .placeOrder(quantity, limitPrice, tpPrice, stopLoss, side)
      .then((res) => {
        if (!res || res.retMsg !== "OK") {
          this.logger.error("Order placement failed", { response: res });
          return false;
        };

        const orderDetails = {
          orderId: res.result.orderId,
          strategyId: this.positionManager.getStrategyId(),
          price,
          timestamp: this.quoteStorage.now(),
          quantity: quantity,
          risk,
          stoploss: stopLoss,
          takeprofit: tpPrice,
          orderType: isLimitOrder ? "Limit" : "Market",
          side,
          status: "Pending",
        };
        this.logger.info("Order placed successfully", orderDetails);

        this.positionManager.setCurrentPosition(orderDetails);
        storeOrderDetails(orderDetails);

        this.riskManager.updateCapital();
        return true;
      });
  }

  /**
   * Check if the last order was filled
   * @returns {Promise<boolean>} True if the last order was filled
   */
  async isLastOrderFilled() {
    const currentPosition = this.positionManager.getCurrentPosition();
    if (!currentPosition) return false;

    const { orderId, status } = currentPosition;
    if (status === "Filled") return true;

    this.logger.info("Checking last order status", { orderId });
    return await this.broker.activeOrders().then(async (res) => {
      const currentOrderInfo = res.find(
        (orderInfo) => orderInfo.orderId === orderId
      );
      if (!currentOrderInfo?.orderId) {
        this.positionManager.updatePositionStatus("Filled");
        this.logger.info("Last Order Filled", { orderId });

        // Create a trade record
        const trade = {
          orderId: currentPosition.orderId,
          strategyId: currentPosition.strategyId,
          price: currentPosition.price, // Assuming fill price is order price
          timestamp: new Date(), // Assuming fill time is now
          qty: currentPosition.quantity,
          side: currentPosition.side,
        };
        await createTrade(trade);

        return true;
      }
      this.logger.info("Last Order Not Filled Yet", { orderId });
    });
  }

  /**
   * Cancel the last order
   */
  cancelLastOrder() {
    // Implementation depends on broker API
  }
}

export { OrderManager };
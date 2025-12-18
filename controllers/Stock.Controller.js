import StockIn from "../models/StockIn.Models.js";
import StockOut from "../models/StockOut.Models.js";

export const getStockSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    const stockIns = await StockIn.find({ userId });
    const stockOuts = await StockOut.find({ userId });

    const map = new Map();

    const makeKey = (p) => [p.productCode, p.productName, p.category, p.size, p.color, p.unit || 'pcs'].join('|');

    for (const s of stockIns) {
      const key = makeKey(s);
      const curr = map.get(key) || { 
        productCode: s.productCode, 
        productName: s.productName, 
        category: s.category, 
        size: s.size, 
        color: s.color, 
        unit: s.unit || 'pcs', 
        in: 0, 
        out: 0,
        totalCost: 0 
      };
      
      const qty = Number(s.quantity);
      const cost = Number(s.totalAmount);
      
      curr.in += isNaN(qty) ? 0 : qty;
      curr.totalCost += isNaN(cost) ? 0 : cost;
      
      map.set(key, curr);
    }

    for (const s of stockOuts) {
      const key = makeKey(s);
      const curr = map.get(key) || { 
        productCode: s.productCode, 
        productName: s.productName, 
        category: s.category, 
        size: s.size, 
        color: s.color, 
        unit: s.unit || 'pcs', 
        in: 0, 
        out: 0,
        totalCost: 0
      };
      
      const qty = Number(s.quantity);
      curr.out += isNaN(qty) ? 0 : qty;
      
      map.set(key, curr);
    }

    const summary = Array.from(map.values())
      .map((v) => {
        const availableQuantity = Number(v.in) - Number(v.out);
        // Calculate average cost per unit based on total stock in
        // If v.in is 0, avoid division by zero
        const avgPrice = v.in > 0 ? v.totalCost / v.in : 0;
        const inventoryValue = availableQuantity * avgPrice;
        
        return { 
          ...v, 
          availableQuantity,
          avgPrice: isNaN(avgPrice) ? 0 : avgPrice,
          inventoryValue: isNaN(inventoryValue) ? 0 : inventoryValue
        };
      })
      .filter((v) => v.availableQuantity > 0);

    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStockOptions = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [categories, sizes, colors] = await Promise.all([
      StockIn.distinct('category', { userId }),
      StockIn.distinct('size', { userId }),
      StockIn.distinct('color', { userId })
    ]);

    res.status(200).json({ success: true, data: { categories, sizes, colors } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

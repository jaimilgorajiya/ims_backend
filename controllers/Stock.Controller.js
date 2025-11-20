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
      const curr = map.get(key) || { productCode: s.productCode, productName: s.productName, category: s.category, size: s.size, color: s.color, unit: s.unit || 'pcs', in: 0, out: 0 };
      curr.in += Number(s.quantity || 0);
      map.set(key, curr);
    }

    for (const s of stockOuts) {
      const key = makeKey(s);
      const curr = map.get(key) || { productCode: s.productCode, productName: s.productName, category: s.category, size: s.size, color: s.color, unit: s.unit || 'pcs', in: 0, out: 0 };
      curr.out += Number(s.quantity || 0);
      map.set(key, curr);
    }

    const summary = Array.from(map.values())
      .map((v) => ({ ...v, availableQuantity: Number(v.in) - Number(v.out) }))
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

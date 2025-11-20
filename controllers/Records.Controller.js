import StockIn from "../models/StockIn.Models.js";
import StockOut from "../models/StockOut.Models.js";

export const getAllRecords = async (req, res) => {
  try {
    const userId = req.user.userId;

    const stockIns = StockIn.find({ userId }).lean();
    const stockOuts = StockOut.find({ userId }).lean();

    const [ins, outs] = await Promise.all([stockIns, stockOuts]);

    const allRecords = [
      ...ins.map(item => ({ ...item, type: 'Stock In' })),
      ...outs.map(item => ({ ...item, type: 'Stock Out' }))
    ];

    // Sort all records by creation date, descending
    allRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      message: "All records retrieved successfully",
      data: allRecords,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

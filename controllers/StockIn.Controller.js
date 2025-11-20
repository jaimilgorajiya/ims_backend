import  StockIn  from "../models/StockIn.Models.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import generateReceipt from "../utils/pdfGenerator.js";  

const generateTransactionId = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `SINV-${timestamp}`;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createStockIn = async(req, res) => {
    try{
    const data = req.body;
    data.userId = req.user.userId;
    data.transactionId = generateTransactionId();
    data.totalAmount = data.quantity * data.pricePerUnit;

    const newStock = await StockIn.create(data);

    const receiptDir = path.join(__dirname, "../uploads/StockIn");
    if(!fs.existsSync(receiptDir)){
        fs.mkdirSync(receiptDir , { recursive: true });
    }

    const filePath = path.join(receiptDir, `${newStock._id}.pdf`);
    await generateReceipt(newStock.toObject(), filePath, "stock-in");

    newStock.receiptPath = `/uploads/StockIn/${newStock._id}.pdf`;
    await newStock.save();

    res.status(201).json({
        success: true,
        message: "Stock In created successfully",
        data  : newStock
    });
    }
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message      
    });
    }
}

export const getAllStockIns = async(req, res) => {
    try{
    const items = await StockIn.find({ userId: req.user.userId }).sort({ createdAt: -1 });  
    res.status(200).json({
        success: true,
        message: "Stock Ins retrieved successfully",
        data  : items
    });
    }   
    catch(error){
        res.status(500).json({
            success: false,
            message: error.message      
    });
    }
}

export const getStockInById = async(req, res) => {
    try {
        const item = await StockIn.findOne({ _id: req.params.id, userId: req.user.userId });
        if(!item){
            return res.status(404).json({
                success: false,
                message: "Stock In not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Stock In retrieved successfully",
            data  : item
        });
    } catch (error) {
         res.status(500).json({
            success: false,
            message: error.message      
    });
    }
}




import  StockOut  from "../models/StockOut.Models.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import generateReceipt from "../utils/pdfGenerator.js";  

const generateTransactionId = () => {
  const timestamp = Date.now().toString().slice(-6);
  return `SOUT-${timestamp}`;
};
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createStockOut = async(req, res) => {
    try {
        const data = req.body;
        data.userId = req.user.userId;
        data.transactionId = generateTransactionId();
        data.totalAmount = data.quantity * data.pricePerUnit;

        const newStock = await StockOut.create(data);

        const receiptDir = path.join(__dirname, "../uploads/StockOut");
        if(!fs.existsSync(receiptDir)){
            fs.mkdirSync(receiptDir , { recursive: true });
        }

        const filePath = path.join(receiptDir, `${newStock._id}.pdf`);
        await generateReceipt(newStock.toObject(), filePath, "stock-out");

        newStock.receiptPath = `/uploads/StockOut/${newStock._id}.pdf`;
        await newStock.save();
        res.status(201).json({
            success: true,
            message: "Stock Out created successfully",
            data  : newStock
        }); 


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message      
    }); 
    }
}

export const getAllStockOuts = async(req, res) => {
    try {

        const items = await StockOut.find({ userId: req.user.userId }).sort({ createdAt: -1 });  
        res.status(200).json({
            success: true,
            message: "Stock Outs retrieved successfully",
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

export const getStockOutById = async(req,res) => {
    try {
       const item = await StockOut.findOne({ _id: req.params.id, userId: req.user.userId });
         if(!item){
            return res.status(404).json({
                success: false,
                message: "Stock Out not found"
            });
         }
         res.status(200).json({
            success: true,
            message: "Stock Out retrieved successfully",
            data  : item
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message      
    });
    }
}
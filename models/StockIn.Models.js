import mongoose from "mongoose";

const stockInSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transactionId: { type: String },
    vendorName: { type: String, required: true },
    vendorContact: { type: String, required: true },
    productName: { type: String, required: true },
    productCode: { type: String, required: true },
    category: { type: String, required: true },
    size: { type: String, required: true},
    color: { type: String, required: true},
    quantity : { type: Number, required: true },
    unit : { type: String, required: true, default: 'pcs' },
    pricePerUnit : { type: Number, required: true },
    totalAmount : { type: Number, required: true },
    invoiceNumber: { type: String, required: true },
    purchaseOrderNumber: { type: String },
    receivedBy: { type: String, required: true },
    remarks: { type: String , required: false },
    date: { type: Date, default: Date.now  },
    receiptPath: { type: String},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },   
});

const StockIn = mongoose.model('StockIn', stockInSchema);
export default StockIn;
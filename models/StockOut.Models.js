import mongoose from "mongoose";

const stockOutSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transactionId: { type: String },
    partyName : { type: String, required: true },
    partyContact : { type: String, required: true },
    productName : { type: String, required: true },
    productCode : { type: String, required: true },
    category: { type: String , required: true },
    size: { type: String , required: true},
    color: { type: String , required: true},
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'pcs', required: true },
    pricePerUnit: { type: Number, required: true },
    totalAmount: { type: Number , required: true },
    dispatchNoteNo: { type: String , required: true },
    issuedBy: { type: String, required: true },
    approvedBy: { type: String , required: true },
    deliveryMode: { type: String , required: true },
    destination: { type: String , required: true },
    remarks: { type: String , required: false },
    date: { type: Date, default: Date.now},    
    receiptPath: { type: String ,   required: false },
    createdAt: { type: Date, default: Date.now},
    updatedAt: { type: Date, default: Date.now},
});

const StockOut = mongoose.model('StockOut', stockOutSchema);
export default StockOut;
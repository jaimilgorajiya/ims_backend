import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateReceipt = (data, filePath, type = "stock-in") => {
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // === Font Fix for Rupee Symbol ===
const fontPath = path.join(__dirname, "../assets/fonts/NotoSans-Regular.ttf");
if (fs.existsSync(fontPath)) doc.font(fontPath);
else doc.font("Helvetica");


  // === Styles ===
  const headerColor = "#2c3e50";
  const labelColor = "#555";
  const lineColor = "#cccccc";
  const currency = "₹"; // Real rupee symbol
  const formatCurrency = (n) =>
    `${currency}${Number(n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const sectionBox = (yStart, height) => {
    doc
      .lineWidth(0.5)
      .strokeColor(lineColor)
      .roundedRect(50, yStart, 500, height, 6)
      .stroke();
  };
  const drawDivider = () => {
    doc.strokeColor(lineColor).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  };
  const drawKV = (x, y, label, value) => {
    doc.fontSize(10).fillColor(labelColor).text(label, x, y);
    const labelWidth = doc.widthOfString(label);
    doc
      .fontSize(11)
      .fillColor("black")
      .text(value ?? "-", x + Math.max(90, labelWidth + 8), y);
  };

  // === HEADER ===
  const heading = type === "stock-in" ? "STOCK IN RECEIPT" : "STOCK OUT RECEIPT";
  doc.save();
  doc.fillColor(headerColor).roundedRect(50, 50, 500, 36, 8).fill();
  doc.fillColor("white").fontSize(16).text(heading, 60, 58, { align: "center", width: 480 });
  doc.restore();

  // === FIXED DATE (Always in IST) ===
  const dtSource = data?.date || data?.createdAt || Date.now();
  let dt = new Date(dtSource);
  if (isNaN(dt.getTime())) dt = new Date();

  const istDate = new Date(dt.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

  const dateTimeStr = istDate.toLocaleString("en-IN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  doc.moveTo(50, 92);
  doc.moveDown(0.6);
  doc
    .fontSize(10)
    .fillColor(labelColor)
    .text(`Date & Time: ${dateTimeStr}`, 50, 98, { align: "right", width: 500 });
  if (data.transactionId) {
    doc.text(`Transaction ID: ${data.transactionId}`, 50, doc.y, {
      align: "right",
      width: 500,
    });
  }

  doc.moveDown(1.2);
  drawDivider();
  doc.moveDown(0.8);

  // === PARTY / VENDOR DETAILS ===
  doc
    .fontSize(13)
    .fillColor(headerColor)
    .text(type === "stock-in" ? "Vendor Details" : "Party Details", 50, doc.y, {
      width: 500,
    });

  const partyStartY = doc.y + 6;
  const rowH = 18;
  sectionBox(partyStartY - 6, type === "stock-in" ? rowH * 2 + 18 : rowH * 3 + 18);
  const leftX = 64;
  const rightX = 310;
  let y = partyStartY;

  if (type === "stock-in") {
    drawKV(leftX, y, "Name", data.vendorName || "-");
    drawKV(rightX, y, "Contact", data.vendorContact || "-");
    y += rowH;
    drawKV(leftX, y, "Invoice No", data.invoiceNumber || "-");
    drawKV(rightX, y, "PO No", data.purchaseOrderNumber || "-");
  } else {
    drawKV(leftX, y, "Name", data.partyName || "-");
    drawKV(rightX, y, "Contact", data.partyContact || "-");
    y += rowH;
    drawKV(leftX, y, "Dispatch Note", data.dispatchNoteNo || "-");
    drawKV(rightX, y, "Delivery Mode", data.deliveryMode || "-");
    y += rowH;
    drawKV(leftX, y, "Destination", data.destination || "-");
  }

  doc.moveDown((y - doc.y) / 14 + 2);
  doc.moveDown(0.6);
  drawDivider();
  doc.moveDown(0.6);

  // === PRODUCT DETAILS ===
  doc
    .fontSize(13)
    .fillColor(headerColor)
    .text("Product Details", 50, doc.y, { width: 500 });

  const prodStartY = doc.y + 6;
  sectionBox(prodStartY - 6, 18 * 4 + 22);
  y = prodStartY;
  drawKV(leftX, y, "Product Name", data.productName || "-");
  drawKV(rightX, y, "Product Code", data.productCode || "-");
  y += rowH;
  drawKV(leftX, y, "Category", data.category || "-");
  drawKV(rightX, y, "Quantity", `${data.quantity ?? "-"} ${data.unit || ""}`.trim());
  y += rowH;
  drawKV(leftX, y, "Size", data.size || "-");
  drawKV(rightX, y, "Color", data.color || "-");
  y += rowH;
  drawKV(leftX, y, "Price per Unit", formatCurrency(data.pricePerUnit));
  drawKV(rightX, y, "Total Amount", formatCurrency(data.totalAmount));
  doc.moveDown((y - doc.y) / 14 + 2);

  doc.moveDown(0.6);
  drawDivider();
  doc.moveDown(0.6);

  // === STAFF DETAILS ===
  doc
    .fontSize(13)
    .fillColor(headerColor)
    .text("Staff Details", 50, doc.y, { width: 500 });
  const staffStartY = doc.y + 6;
  sectionBox(staffStartY - 6, type === "stock-in" ? 18 + 22 : 18 * 2 + 22);
  y = staffStartY;
  if (type === "stock-in") {
    drawKV(leftX, y, "Received By", data.receivedBy || "-");
  } else {
    drawKV(leftX, y, "Issued By", data.issuedBy || "-");
    y += rowH;
    drawKV(leftX, y, "Approved By", data.approvedBy || "-");
  }

  doc.moveDown((y - doc.y) / 14 + 2);

  if (data.remarks) {
    doc.moveDown(0.8);
    doc
      .font("Helvetica-Oblique")
      .fontSize(11)
      .fillColor("black")
      .text(`Remarks: ${data.remarks}`);
  }

  // === SIGNATURE SECTION ===
  doc.moveDown(2);
  doc.fontSize(12).fillColor(labelColor).text("Authorized Signature:", 400);

  doc.moveDown(0.6);
  doc.font("Helvetica-Bold").fillColor("black").text("Jaimil Gorajiya", 400);

  const nameWidth = doc.widthOfString("Jaimil Gorajiya");
  const underlineY = doc.y - 2; // position line just below the rendered name
  doc
    .strokeColor(lineColor)
    .moveTo(400, underlineY)
    .lineTo(400 + nameWidth, underlineY)
    .stroke();

  // === FOOTER ===
  doc.moveDown(5);
  doc.strokeColor(lineColor).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);
  doc
    .fontSize(10)
    .fillColor("#777")
    .text("Generated by Jaimil Gorajiya — Inventory Management System", 50, doc.y, {
      align: "center",
      width: 500,
    });

  doc.end();
};

export default generateReceipt;

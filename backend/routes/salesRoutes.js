const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { createArrayCsvWriter } = require('csv-writer');
const Sale = require('../models/Sales');
const skuMap = require('../sku-mapping.json');

const router = express.Router();

// Multer setup to handle file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ⬆ Upload Route
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Read Excel/CSV file
    const workbook = xlsx.readFile(req.file.path, { type: 'binary', codepage: 65001 });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: '' }); //parsed the sheet to JSON

  /*    // ✅ ADD THIS LINE TO CHECK THE FIRST FEW ROWS
    console.log("Parsed Data Preview:", data.slice(0, 5));
      // ✅ OPTIONAL: Also log the headers of the first row
    console.log("Detected Headers:", Object.keys(data[0]));       */

    const missingMappings = [];

    // Map each row and check for missing SKUs
    const normalizeKey = key => key.trim().toLowerCase();

const mappedData = data.map(row => {
  const normalizedRow = {};
  for (const key in row) {
    normalizedRow[normalizeKey(key)] = row[key];
  }

  const sku = String(normalizedRow["sku"] || '').trim();
  const msku = skuMap[sku];

  if (!msku) missingMappings.push(sku);

  return {
  id: Number(normalizedRow["_id"]) || 0, // Use _id or generate a new one
    sku,
    msku: msku || 'UNKNOWN',
    quantity: Number(normalizedRow["quantity"]) || 0,

  };
});

    // 🧠 If too many SKUs are unmapped, reject upload
    if (missingMappings.length / data.length > 0.2) {
      fs.unlinkSync(req.file.path);

      // Write unmapped SKUs to CSV
      const csvWriter = createArrayCsvWriter({
        header: ['Unmapped SKU'],
        path: './uploads/unmapped.csv',
      });

      await csvWriter.writeRecords(missingMappings.map(sku => [sku]));

      return res.status(400).json({
        error: 'Too many SKUs missing in mapping. Please update the mapping file.',
        missingMappings,
      });
    }

    // ✅ Insert into MongoDB
    await Sale.insertMany(mappedData);

    // 🧹 Clean up uploaded file
    fs.unlinkSync(req.file.path);

    // Return summary
    res.json({
      message: 'Upload complete',
      count: mappedData.length,
      missingMappings,
      tooManyUnmapped: false,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File processing failed' });
  }
});

// ❌ Delete all sales
router.delete('/clear', async (req, res) => {
  try {
    await Sale.deleteMany({});
    res.status(200).json({ message: 'Sales data cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear sales data' });
  }
});

// 📥 Get all sales
router.get('/all', async (req, res) => {
  try {
    const sales = await Sale.find();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
});

module.exports = router;

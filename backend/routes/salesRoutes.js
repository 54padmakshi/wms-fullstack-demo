const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const Sale = require('../models/Sales');
const skuMap = require('../sku-mapping.json');
const router = express.Router();

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });



router.post('/upload', upload.single('file'), async (req, res) => {
    try{
        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
    
        // 🔁 Map SKUs to MSKUs here
        const missingMappings = [];      
const mappedData = data.map(row => {
  const sku = String(row.SKU || '').trim();
  const msku = skuMap[sku];
  if (!msku) missingMappings.push(sku);
  return {
    date: row.Date || '',
    sku: sku,
    msku: msku || 'UNKNOWN',
    quantity: row.Quantity || 0,
  };
});

 // ❗ Check for excessive missing mappings (e.g., more than 20%)
 if (missingMappings.length / data.length > 0.2) {
  fs.unlinkSync(req.file.path); // Clean up the uploaded file
  return res.status(400).json({
    error: 'Too many SKUs missing in mapping. Please update the mapping file.',
    missingMappings,
  });
}
    
        // Save to MongoDB
        await Sale.insertMany(mappedData);
    
        // Cleanup: remove uploaded file
        fs.unlinkSync(req.file.path);
    
        res.json({ message: 'Upload & mapping complete', count: mappedData.length,missingMappings });
      } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'File processing failed' });
      }
    });

    router.delete('/clear', async (req, res) => {
      try {
        await Sale.deleteMany({});
        res.status(200).json({ message: 'Sales data cleared' });
      } catch (err) {
        res.status(500).json({ error: 'Failed to clear sales data' });
      }
    });

router.get('/all', async (req, res) => {
  const sales = await Sale.find();
  res.json(sales);
});

module.exports = router;

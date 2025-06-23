const xlsx = require('xlsx');
const fs = require('fs');

// Step 1: Read Excel file
const workbook = xlsx.readFile('./sku-mapping.xlsx');

// ✅ Step 2: Select the correct sheet (named exactly as in your screenshot)
const worksheet = workbook.Sheets['Msku With Skus'];

// Step 3: Convert sheet to JSON
const data = xlsx.utils.sheet_to_json(worksheet);

// Step 4: Create mapping object using lowercase keys
const mapping = {};
data.forEach(row => {
  const sku = row.sku?.toString().trim();
  const msku = row.msku?.toString().trim();
  if (sku && msku) {
    mapping[sku] = msku;
  }
});

// Step 5: Save as JSON
fs.writeFileSync('sku-mapping.json', JSON.stringify(mapping, null, 2));
console.log('✅ sku-mapping.json created successfully!');

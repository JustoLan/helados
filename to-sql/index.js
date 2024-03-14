const fs = require('fs');
const mysql = require('mysql');
const path = require('path');

// MySQL database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'heladoparatodes',
  database: 'heladosprecio' 
};

// Create a MySQL connection
const connection = mysql.createConnection(dbConfig);

// Function to read files in the scraped-data folder
function readFilesInDirectory() {
  return new Promise((resolve, reject) => {
    fs.readdir(path.join(__dirname, '../scraped-data'), (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files.filter(file => file.startsWith('restaurant_prices')));
      }
    });
  });
}

// Function to parse JSON data from file
function parseFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (parseError) {
          reject(parseError);
        }
      }
    });
  });
}

// Function to extract date from filename
function extractDateFromFilename(filename) {
  const dateMatch = filename.match(/restaurant_prices_(\d{4}-\d{2}-\d{2})\.json/);
  return dateMatch ? dateMatch[1] : null;
}

// Function to insert data into MySQL table and move file to logged folder
function insertDataIntoDatabase(data, date, filePath) {
  const values = data.map(entry => [entry.restaurantName, entry.price, date]);
  const sql = 'INSERT INTO restaurant_prices (restaurantName, price, daylogged) VALUES ?';
  connection.query(sql, [values], (err, results) => {
    if (err) {
      console.error('Error inserting data into database:', err);
    } else {
      console.log('Data inserted into database:', results.affectedRows, 'rows affected');
      // Move the file to the logged folder
      const loggedFolderPath = path.join(__dirname, '../scraped-data/logged');
      const newFilePath = path.join(loggedFolderPath, path.basename(filePath));
      fs.rename(filePath, newFilePath, err => {
        if (err) {
          console.error('Error moving file to logged folder:', err);
        } else {
          console.log('File moved to logged folder:', path.basename(filePath));
        }
      });
    }
  });
}

// Main function
async function main() {
  try {
    // Read files in directory
    const files = await readFilesInDirectory();

    // Parse and insert data from all files
    for (const file of files) {
      const date = extractDateFromFilename(file);
      if (!date) {
        console.error('Unable to extract date from filename:', file);
        continue;
      }
      const filePath = path.join(__dirname, '../scraped-data', file);
      const data = await parseFile(filePath);
      insertDataIntoDatabase(data, date, filePath);
    }

    // Close MySQL connection
    connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the main function
main();
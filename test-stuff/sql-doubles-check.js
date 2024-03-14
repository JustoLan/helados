const mysql = require('mysql');

// MySQL database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'heladoparatodes',
  database: 'heladosprecio' 
};

// Create a MySQL connection
const connection = mysql.createConnection(dbConfig);

// Function to check for duplicate entries in the database
function checkDuplicateEntries(date) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT MIN(id) AS id, restaurantName, price, daylogged FROM restaurant_prices WHERE daylogged = ? GROUP BY restaurantName, price, daylogged HAVING COUNT(*) > 1`;
      connection.query(sql, [date], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
// Usage example
async function checkDuplicatesForDate(date) {
  try {
    // Connect to the MySQL database
    connection.connect();
    
    const duplicates = await checkDuplicateEntries(date);
    if (duplicates.length > 0) {
      console.log(`Duplicate entries found for date ${date}:`);
      duplicates.forEach(entry => {
        console.log(`ID: ${entry.id}, Restaurant: ${entry.restaurantName}, Price: ${entry.price}`);
      });
    } else {
      console.log(`No duplicate entries found for date ${date}.`);
    }
  } catch (error) {
    console.error('Error checking for duplicate entries:', error);
  } finally {
    // Close the MySQL connection
    connection.end();
  }
}

// Call the function with a specific date
checkDuplicatesForDate('2024-02-28'); // Change the date as needed
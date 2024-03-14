const fs = require('fs');

function writeToJson(data, filename) {
    const jsonData = JSON.stringify(data, null, 2);

    fs.writeFile(filename, jsonData, (err) => {
        if (err) {
            console.error(`Error writing JSON data to ${filename}:`, err);
        } else {
            console.log(`Data has been written to ${filename}`);
        }
    });
}

module.exports = writeToJson;
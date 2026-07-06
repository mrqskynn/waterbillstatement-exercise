const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw-y_3yF2U5SinBNiKwhn1eLIv4wPG86hToru2EAfUVcBlgjBLN7XskvHWgVEbGXHFQ/exec";
 
let countProcessed = 0;
 
document.getElementById('generateBtn').addEventListener('click', function() {
    // 1. DOM Access: Retrieve Input Data
    const name = document.getElementById('customerName').value.trim();
    const consumptionInput = document.getElementById('consumption').value;
    const customerType = document.getElementById('customerType').value;
 
    // 2. Control Structure: Input Validation
    if (name === "" || consumptionInput === "") {
        alert("Please fill in all fields completely.");
        return;
    }
 
    const consumption = parseFloat(consumptionInput);
    if (isNaN(consumption) || consumption < 0) {
        alert("Consumption must be a valid, positive number.");
        return;
    }
 
    // 3. Control Structure: Loop for Tiered Billing Calculation
    let remainingConsumption = consumption;
    let grossAmount = 0;
    
    const tiers = [
        { limit: 20, rate: 25.00 },
        { limit: 20, rate: 35.00 }, // next 20 units (up to 40)
        { limit: 20, rate: 45.00 }, // next 20 units (up to 60)
        { limit: Infinity, rate: 60.00 } // everything above 60
    ];
 
    for (let i = 0; i < tiers.length; i++) {
        if (remainingConsumption > tiers[i].limit) {
            grossAmount += tiers[i].limit * tiers[i].rate;
            remainingConsumption -= tiers[i].limit;
        } else {
            grossAmount += remainingConsumption * tiers[i].rate;
            break;
        }
    }
 
    // 4. Control Structure: Conditional Switch for Discounts
    let discountRate = 0;
    switch(customerType) {
        case 'Senior Citizen':
            discountRate = 0.25;
            break;
        case 'Solo Parent':
            discountRate = 0.15;
            break;
        case 'Regular':
        default:
            discountRate = 0.00;
            break;
    }
 
    const discountAmount = grossAmount * discountRate;
    const totalAmount = grossAmount - discountAmount;
 
    // 5. Update UI (DOM Access)
    countProcessed++;
    document.getElementById('transactionCount').innerText = countProcessed;
 
    document.getElementById('stmtDate').innerText = new Date().toLocaleDateString();
    document.getElementById('stmtName').innerText = name;
    document.getElementById('stmtType').innerText = customerType;
    document.getElementById('stmtConsumption').innerText = consumption.toFixed(2);
    document.getElementById('stmtGross').innerText = grossAmount.toFixed(2);
    document.getElementById('stmtDiscount').innerText = discountAmount.toFixed(2);
    document.getElementById('stmtTotal').innerText = totalAmount.toFixed(2);
 
    // Unhide statement box
    document.getElementById('billingStatement').classList.remove('hidden');
 
    // 6. Send Data to Google Sheets via Fetch API
    const dataToSend = {
        timestamp: new Date().toLocaleString(),
        customerName: name,
        consumption: consumption,
        customerType: customerType,
        gross: grossAmount.toFixed(2),
        discount: discountAmount.toFixed(2),
        total: totalAmount.toFixed(2)
    };
 
    fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataToSend)
    })
    .then(() => {
        console.log("Data sent to Google Sheets successfully.");
    })
    .catch(error => {
        console.error("Error pushing data to cloud storage:", error);
    });

    document.getElementById('customerName').value = '';
    document.getElementById('consumption').value = '';
    document.getElementById('customerType').value = 'Regular';
});
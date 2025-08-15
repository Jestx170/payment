// PayWise App JavaScript Functions
// =================================

// Navigation System
// -----------------
function navigateTo(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active', 'prev');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    // Update balance if navigating to wallet
    if (screenId === 'wallet') {
        updateBalance();
    }
}

// Wallet Balance Management
// ------------------------
function updateBalance() {
    // This would normally fetch from API
    const balanceElement = document.getElementById('balance-amount');
    if (balanceElement) {
        const currentBalance = parseFloat(balanceElement.textContent.replace('฿', '').replace(',', ''));
        balanceElement.textContent = `฿${currentBalance.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    }
}

function updateWalletBalance(addAmount) {
    const balanceElement = document.getElementById('balance-amount');
    if (balanceElement) {
        const currentBalance = parseFloat(balanceElement.textContent.replace('฿', '').replace(',', ''));
        const newBalance = currentBalance + addAmount;
        balanceElement.textContent = `฿${newBalance.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    }
}

function deductWalletBalance(amount) {
    const balanceElement = document.getElementById('balance-amount');
    if (balanceElement) {
        const currentBalance = parseFloat(balanceElement.textContent.replace('฿', '').replace(',', ''));
        const newBalance = currentBalance - amount;
        balanceElement.textContent = `฿${newBalance.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    }
}

// Top-up Functions
// ---------------
function setAmount(amount) {
    document.getElementById('topup-amount').value = amount;
    
    // Update quick amount button states
    document.querySelectorAll('.quick-amount').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    updateFees();
}

function updateFees() {
    const amountInput = document.getElementById('topup-amount');
    const methodSelect = document.getElementById('topup-method');
    
    if (!amountInput || !methodSelect) return;
    
    const amount = parseFloat(amountInput.value) || 0;
    const method = methodSelect.value;
    
    let feeRate = 0;
    let fixedFee = 0;
    let feeDetail = '';
    
    // Fee calculation based on method
    switch(method) {
        case 'card':
            feeRate = 0.029; // 2.9%
            fixedFee = 10;
            feeDetail = '(2.9% + ฿10)';
            break;
        case 'bank':
            feeRate = 0;
            fixedFee = 15;
            feeDetail = '(ค่าโอนธนาคาร)';
            break;
        case 'paypal':
            feeRate = 0.034; // 3.4%
            fixedFee = 0;
            feeDetail = '(3.4% flat)';
            break;
        case 'promptpay':
            feeRate = 0;
            fixedFee = 0;
            feeDetail = '(ฟรี!)';
            break;
        case 'truemoney':
            feeRate = 0.005; // 0.5%
            fixedFee = 5;
            feeDetail = '(0.5% + ฿5)';
            break;
    }
    
    const processingFee = (amount * feeRate) + fixedFee;
    const total = amount + processingFee;
    
    // Update display elements
    const feeAmountEl = document.getElementById('fee-amount');
    const feeProcessingEl = document.getElementById('fee-processing');
    const feeTotalEl = document.getElementById('fee-total');
    const confirmAmountEl = document.getElementById('confirm-amount');
    const feeDetailEl = document.getElementById('fee-detail');
    
    if (feeAmountEl) feeAmountEl.textContent = `฿${amount.toFixed(2)}`;
    if (feeProcessingEl) feeProcessingEl.textContent = `฿${processingFee.toFixed(2)}`;
    if (feeTotalEl) feeTotalEl.textContent = `฿${total.toFixed(2)}`;
    if (confirmAmountEl) confirmAmountEl.textContent = total.toFixed(2);
    if (feeDetailEl) feeDetailEl.textContent = feeDetail;
    
    // Show/hide payment method details
    showPaymentMethodDetails(method);
    
    // Enable/disable button based on amount
    const button = document.getElementById('topup-btn');
    if (button) {
        if (amount >= 50 && amount <= 50000) {
            button.disabled = false;
            button.style.opacity = '1';
        } else {
            button.disabled = true;
            button.style.opacity = '0.6';
        }
    }
}

function showPaymentMethodDetails(method) {
    // Hide all payment method sections
    const sections = ['card-details', 'bank-details', 'promptpay-details'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    });
    
    // Show relevant section
    const targetSection = method === 'card' ? 'card-details' : 
                        method === 'bank' ? 'bank-details' :
                        method === 'promptpay' ? 'promptpay-details' : null;
    
    if (targetSection) {
        const element = document.getElementById(targetSection);
        if (element) element.style.display = 'block';
    }
}

// Form Formatting Functions
// ------------------------
function formatCardNumber(input) {
    let value = input.value.replace(/\s/g, '').replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = value;
    
    // Auto-detect card type (optional enhancement)
    detectCardType(value);
}

function formatExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
}

function detectCardType(cardNumber) {
    const firstDigit = cardNumber.charAt(0);
    const firstTwoDigits = cardNumber.substring(0, 2);
    
    let cardType = 'unknown';
    
    if (firstDigit === '4') {
        cardType = 'visa';
    } else if (firstTwoDigits >= '51' && firstTwoDigits <= '55') {
        cardType = 'mastercard';
    } else if (firstTwoDigits === '34' || firstTwoDigits === '37') {
        cardType = 'amex';
    }
    
    // You can add visual indicators here
    console.log('Card type detected:', cardType);
}

// Transaction Processing Functions
// -------------------------------
function processTopup() {
    const amountInput = document.getElementById('topup-amount');
    const methodSelect = document.getElementById('topup-method');
    
    if (!amountInput || !methodSelect) return;
    
    const amount = amountInput.value;
    const method = methodSelect.value;
    
    // Validate required fields
    if (method === 'card') {
        const cardNumber = document.getElementById('card-number');
        const expiry = document.getElementById('card-expiry');
        const cvv = document.getElementById('card-cvv');
        const name = document.getElementById('card-name');
        
        if (!cardNumber || !cardNumber.value || !expiry || !expiry.value || 
            !cvv || !cvv.value || !name || !name.value) {
            showAlert('กรุณากรอกข้อมูลบัตรให้ครบถ้วน', 'warning');
            return;
        }
        
        // Validate card number (basic Luhn algorithm check)
        if (!isValidCardNumber(cardNumber.value.replace(/\s/g, ''))) {
            showAlert('หมายเลขบัตรไม่ถูกต้อง', 'error');
            return;
        }
        
        // Validate expiry date
        if (!isValidExpiryDate(expiry.value)) {
            showAlert('วันหมดอายุไม่ถูกต้อง', 'error');
            return;
        }
    }
    
    if (!amount || amount < 50 || amount > 50000) {
        showAlert('กรุณาระบุจำนวนเงินระหว่าง ฿50 - ฿50,000', 'warning');
        return;
    }
    
    // Show loading state
    const button = document.getElementById('topup-btn');
    if (button) {
        button.textContent = 'กำลังประมวลผล...';
        button.disabled = true;
        
        // Add loading animation
        button.innerHTML = '<span class="loading-spinner">⟳</span> กำลังประมวลผล...';
    }
    
    // Simulate 3DS authentication for card payments
    if (method === 'card') {
        setTimeout(() => {
            simulate3DSAuth(() => {
                completeTopup(parseFloat(amount));
            });
        }, 1000);
    } else {
        setTimeout(() => {
            completeTopup(parseFloat(amount));
        }, 2000);
    }
}

function completeTopup(amount) {
    // Generate transaction ID
    const transactionId = 'TXN-' + Date.now();
    
    // Store transaction details for receipt
    localStorage.setItem('lastTopupTransaction', JSON.stringify({
        id: transactionId,
        amount: amount,
        timestamp: new Date().toISOString(),
        method: document.getElementById('topup-method').value
    }));
    
    navigateTo('topup-success');
    updateWalletBalance(amount);
}

function simulate3DSAuth(callback) {
    // Simulate 3D Secure authentication
    showAlert('กำลังยืนยันตัวตนผ่าน 3D Secure...', 'info');
    setTimeout(() => {
        showAlert('การยืนยันตัวตนสำเร็จ', 'success');
        setTimeout(callback, 500);
    }, 1500);
}

// Payment Functions
// ----------------
function simulateQRScan() {
    showAlert('กำลังสแกน QR Code...', 'info');
    setTimeout(() => {
        navigateTo('payment-confirm');
    }, 1000);
}

function processPayment() {
    const payAmount = 127.50; // This would come from QR scan
    
    // Check balance
    const balanceElement = document.getElementById('balance-amount');
    if (balanceElement) {
        const currentBalance = parseFloat(balanceElement.textContent.replace('฿', '').replace(',', ''));
        if (currentBalance < payAmount) {
            showAlert('ยอดเงินไม่เพียงพอ กรุณาเติมเงิน', 'error');
            return;
        }
    }
    
    // Simulate payment processing
    showAlert('กำลังดำเนินการชำระเงิน...', 'info');
    setTimeout(() => {
        navigateTo('payment-success');
        deductWalletBalance(payAmount);
        
        // Generate payment transaction
        const transactionId = 'PAY-' + Date.now();
        localStorage.setItem('lastPaymentTransaction', JSON.stringify({
            id: transactionId,
            amount: payAmount,
            merchant: '7-Eleven Sukhumvit',
            timestamp: new Date().toISOString()
        }));
    }, 1500);
}

// Validation Functions
// -------------------
function isValidCardNumber(cardNumber) {
    // Basic Luhn algorithm implementation
    let sum = 0;
    let alternate = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let n = parseInt(cardNumber.charAt(i), 10);
        
        if (alternate) {
            n *= 2;
            if (n > 9) {
                n = (n % 10) + 1;
            }
        }
        
        sum += n;
        alternate = !alternate;
    }
    
    return (sum % 10) === 0;
}

function isValidExpiryDate(expiry) {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    
    const [month, year] = expiry.split('/').map(num => parseInt(num, 10));
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    if (month < 1 || month > 12) return false;
    if (year < currentYear || (year === currentYear && month < currentMonth)) return false;
    
    return true;
}

// Alert System
// -----------
function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#fee2e2' : type === 'success' ? '#dcfce7' : type === 'warning' ? '#fef3c7' : '#dbeafe'};
        color: ${type === 'error' ? '#dc2626' : type === 'success' ? '#16a34a' : type === 'warning' ? '#d97706' : '#2563eb'};
        border: 2px solid ${type === 'error' ? '#fecaca' : type === 'success' ? '#bbf7d0' : type === 'warning' ? '#fed7aa' : '#bfdbfe'};
        border-radius: 12px;
        padding: 15px 20px;
        z-index: 1000;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        animation: slideDown 0.3s ease;
        max-width: 350px;
        text-align: center;
    `;
    
    alert.textContent = message;
    document.body.appendChild(alert);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        alert.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(alert)) {
                document.body.removeChild(alert);
            }
        }, 300);
    }, 3000);
}

// Multi-currency Functions
// -----------------------
function convertCurrency(amount, fromCurrency, toCurrency) {
    // Mock exchange rates - in real app, fetch from API
    const rates = {
        'USD': 35.75,
        'EUR': 38.92,
        'GBP': 44.25,
        'JPY': 0.24,
        'SGD': 26.80,
        'THB': 1.00
    };
    
    if (fromCurrency === 'THB') {
        return amount / rates[toCurrency];
    } else if (toCurrency === 'THB') {
        return amount * rates[fromCurrency];
    } else {
        // Convert through THB
        const thbAmount = amount * rates[fromCurrency];
        return thbAmount / rates[toCurrency];
    }
}

function updateExchangeRates() {
    // Simulate fetching fresh rates
    const lastUpdate = new Date().toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const rateElements = document.querySelectorAll('.exchange-rate-time');
    rateElements.forEach(el => {
        el.textContent = `อัปเดตล่าสุด: ${lastUpdate}`;
    });
}

// AI Recommendations Functions
// ----------------------------
function analyzeSpending() {
    // Mock AI analysis
    return {
        totalSpent: 3450.50,
        topCategory: 'Food & Dining',
        suggestion: 'คุณใช้จ่ายกับอาหารมากกว่าเดือนที่แล้ว 15% ลองหาร้านอาหารราคาประหยุดดู',
        savingsGoal: 1000
    };
}

function processReceiptPhoto() {
    // Simulate AI receipt processing
    showAlert('กำลังวิเคราะห์รูปใบเสร็จ...', 'info');
    
    setTimeout(() => {
        const analysis = {
            merchant: 'Big C Supercenter',
            total: 267.50,
            items: ['นม', 'ขนมปัง', 'ผักใส'],
            category: 'Groceries',
            suggestion: 'สินค้าประเภทนี้มักมีโปรโมชั่นในช่วงสุดสัปดาห์'
        };
        
        showReceiptAnalysis(analysis);
    }, 2000);
}

function showReceiptAnalysis(analysis) {
    showAlert(`วิเคราะห์แล้ว: ${analysis.merchant} ทั้งหมด ฿${analysis.total}`, 'success');
}

// Initialize App
// -------------
document.addEventListener('DOMContentLoaded', function() {
    console.log('PayWise App Initialized');
    
    // Initialize fees if on top-up page
    const topupAmount = document.getElementById('topup-amount');
    if (topupAmount) {
        updateFees();
        
        // Add real-time validation
        topupAmount.addEventListener('input', function() {
            const amount = parseFloat(this.value);
            const button = document.getElementById('topup-btn');
            
            if (amount < 50 || amount > 50000) {
                this.style.borderColor = '#dc2626';
            } else {
                this.style.borderColor = '#e2e8f0';
            }
        });
    }
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateX(-50%) translateY(0); opacity: 1; }
            to { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        }
        .loading-spinner {
            display: inline-block;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Update exchange rates every 30 seconds
    setInterval(updateExchangeRates, 30000);
    
    // Set up modal functionality
    window.onclick = function(event) {
        const modal = document.querySelector('.modal.active');
        if (modal && event.target === modal) {
            modal.classList.remove('active');
        }
    };
    
    console.log('All PayWise functions loaded successfully');
});
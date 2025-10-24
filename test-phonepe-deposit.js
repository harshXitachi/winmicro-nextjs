const testPhonePeDeposit = async () => {
  try {
    console.log('🧪 Testing PhonePe Deposit API...');
    
    // Test data
    const testData = {
      amount: 100,
      phoneNumber: '9876543210'
    };
    
    console.log('📤 Sending request:', testData);
    
    const response = await fetch('http://localhost:3000/api/wallet/deposit-inr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real test, you'd need proper authentication headers
      },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    
    console.log('📦 Response status:', response.status);
    console.log('📦 Response data:', data);
    
    if (response.ok) {
      console.log('✅ PhonePe deposit API is working!');
      console.log('🔗 Payment URL:', data.paymentUrl);
      console.log('🆔 Transaction ID:', data.transactionId);
      console.log('🧪 Using Mock:', data.isMock);
    } else {
      console.log('❌ PhonePe deposit API failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testPhonePeDeposit();

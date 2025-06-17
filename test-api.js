const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Test admin login
async function testAdminLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'adminpassword',
      }),
    });

    const data = await response.json();
    console.log('Admin Login Response:', {
      status: response.status,
      data,
    });
    return data;
  } catch (error) {
    console.error('Error testing admin login:', error);
  }
}

// Test canteen staff login
async function testCanteenStaffLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/canteen-staff/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'staff@example.com',
        password: 'staffpassword',
      }),
    });

    const data = await response.json();
    console.log('Canteen Staff Login Response:', {
      status: response.status,
      data,
    });
    return data;
  } catch (error) {
    console.error('Error testing canteen staff login:', error);
  }
}

// Run tests
async function runTests() {
  console.log('Testing Admin Login...');
  await testAdminLogin();

  console.log('\nTesting Canteen Staff Login...');
  await testCanteenStaffLogin();
}

runTests();

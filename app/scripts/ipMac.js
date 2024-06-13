// ipMac.js
const getMac = async (authToken) => {
  try {
    
    const response = await fetch("https://hallmonitor1.tail1e215.ts.net:3002/api2/ipMacMap", {
      headers: {
        Authorization: authToken,
      },
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching host status:", error);
    return {};
  }
};

const getAllMac = async (authToken) => {
  try {
    const response = await getMac(authToken);
    return response; // Assuming the response contains an object with IP as keys
  } catch (error) {
    console.error('Error fetching MAC data:', error);
    return {};
  }
};

const updateConnectionStatus = async (authToken) => {
  try {
    const response = await fetch(`https://hallmonitor1.tail1e215.ts.net:3002/api2/ipMacMap`, {
      headers: {
        Authorization: authToken,
      },
    });
    const result = await response.json();
    return result; // Assuming the response contains an object with IP as keys and connection status
  } catch (error) {
    console.error('Error fetching connection status:', error);
    return {};
  }
};

const updateName = async (ipAddress, newName, authToken) => {
  try {
    const response = await fetch(`https://hallmonitor1.tail1e215.ts.net:3002/api2/updatename/${ipAddress}`, {
      method: 'POST',
      headers: {
        Authorization: authToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newName })
    });

    if (response.ok) {
      console.log('Name updated successfully');
      return "success";
    } else {
      const errorMessage = await response.text();
      console.error('Failed to update name:', errorMessage || response.statusText);
      return "danger";
    }
  } catch (error) {
    console.error('Error updating name:', error.message);
    return "danger";
  }
};

export { getAllMac, updateConnectionStatus, updateName };
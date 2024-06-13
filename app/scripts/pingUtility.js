// pingUtility.js
const checkHostStatus = async (ipAddress) => {
    try {
      const response = await fetch(`https://hallmonitor1.tail1e215.ts.net/api/ping/${ipAddress}`);
      const result = await response.json();
      return result.alive ? 'Online' : 'Unreachable';
    } catch (error) {
      console.error('Error fetching host status:', error);
      return 'Unreachable';
    }
  };
  
  export { checkHostStatus };
  
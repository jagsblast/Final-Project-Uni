import React, { useState, useEffect } from 'react';
import { checkHostStatus } from './pingUtility';
import { updateConnectionStatus, updateName, getAllMac } from './ipMac';
import NameInput from './NameInput';
import ProgressBar from 'react-bootstrap/ProgressBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import Alert from 'react-bootstrap/Alert';

const AddCard = ({ id, ip, macData, onRevokeClick, token }) => {
  const [status, setStatus] = useState('Loading...');
  const [macAddress, setMacAddress] = useState('');
  const [name, setName] = useState('');
  const [connected, setConnected] = useState('');
  const [device_type, setDevice_type] = useState('');
  const [Device_info_given, setDevice_info_given] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [alerttype, setAlerttype] = useState('');

  const handleNameChange = async (newName) => {
    setName(newName);
    try {
      const updatestatus = await updateName(ip, newName, token);
      console.log(await updatestatus);
      if (updatestatus === "success") {
        setSuccessMessage('Name updated successfully');
        setAlerttype("success");
      } else {
        setSuccessMessage('Error updating name');
        setAlerttype("danger"); // Set alert type to "danger" for error
      }
    } catch (error) {
      console.error('Failed to update name:', error.message);
      setSuccessMessage('Error updating name');
      setAlerttype("danger"); // Set alert type to "danger" for error
    }
  };

  const handleAlertClose = () => {
    setSuccessMessage('');
  };

  const handleRevokeClick = async () => {
    try {
      onRevokeClick(id);
    } catch (error) {
      console.error('Error revoking access:', error);
    }
  };

  const fetchHostStatus = async () => {
    try {
      const hostStatus = await checkHostStatus(ip);
      setStatus(hostStatus === 'Online' ? 'Online' : 'Unreachable');
    } catch (error) {
      console.error('Error fetching host status:', error);
      setStatus('Unreachable');
    }
  };

  const fetchConnectionStatus = async () => {
    try {
      if (token) {
        const connectionStatus = await updateConnectionStatus(token);
        setConnected(connectionStatus[ip]?.connected || false);
      }
    } catch (error) {
      console.error('Error fetching connection status:', error);
      setConnected(false);
    }
  };

  useEffect(() => {
    fetchHostStatus();
    fetchConnectionStatus();

    const intervalId = setInterval(() => {
      fetchHostStatus();
      fetchConnectionStatus();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [ip, token]);

  useEffect(() => {
    if (macData[ip] && macData[ip].dev) {
      setMacAddress(macData[ip].mac || '');
      setName(macData[ip].name || '');
      setConnected(macData[ip].connected || false);
      if (macData[ip].dev.device_type) {
        setDevice_type(macData[ip].dev.device_type);
      }
      if (macData[ip].dev.Device_info_given) {
        setDevice_info_given(macData[ip].dev.Device_info_given);
      }
    }
  }, [macData, ip]);

  if (Array.isArray(Device_info_given) && Device_info_given.length > 0) {
    const firstItem = Device_info_given[0];

    if (typeof firstItem === 'string' && firstItem.substr(0, 7) === "{'bar':") {
      Device_info_given[0] = firstItem.substr(9);
    }
  } else {
    console.log('Device_info_given is not in the expected format, could still be waiting for data');
  }

  return (
    <div className='relative text-center flex flex-col text-gray-700 bg-green-100 shadow-md bg-clip-border rounded-xl'>
      <div className={`relative text-center flex flex-col text-gray-700 ${connected=== true ? 'bg-green-100' : 'bg-red-100'} shadow-md bg-clip-border rounded-xl`}>
        {successMessage && (
          <Alert variant={alerttype} onClose={handleAlertClose} dismissible>
            {successMessage}
          </Alert>
        )}
        <div className='p-4'>
          <p>Name: {name}</p>
          <p>ID: {id}</p>
          <p>IP: {ip}</p>
          <p>MAC: {macAddress}</p>
          <div className="flex items-center justify-center space-x-2 flex-wrap">
            <p>Status: {status}</p>
            {(() => {
              switch (status.toLowerCase()) {
                case 'online':
                  return <span className='bg-green-500 rounded-full h-3 w-3'></span>;
                default:
                  return <span className='bg-red-500 rounded-full h-3 w-3'></span>;
              }
            })()}
          </div>
          <div className="flex items-center justify-center space-x-2 flex-wrap">
            <p>WebSocket Connection:</p>
            {(() => {
              switch (connected) {
                case true:
                  return <span className='bg-green-500 rounded-full h-3 w-3'></span>;
                default:
                  return <span className='bg-red-500 rounded-full h-3 w-3'></span>;
              }
            })()}
          </div>
          <br></br>
          <p>Device Type: {device_type}</p>
          <span>
            <p>Device info given:</p>
            {Array.isArray(Device_info_given) ? (
              <ProgressBar>
                {Device_info_given.map((item, index) => {
                  try {
                    const cleanedItem = item.replace(/['":]/g, '').trim();
                    const [category, percentageString, variant] = cleanedItem.split(' ');
                    const percentage = parseInt(percentageString, 10);

                    if (!isNaN(percentage) && variant) {
                      return (
                        <ProgressBar
                          striped
                          variant={variant}
                          now={percentage}
                          label={`${category}: ${percentage}%`}
                          key={index}
                        />
                      );
                    } else {
                      console.error(`Invalid data format at index ${index}: ${item}`);
                    }
                  } catch (error) {
                    console.error(`Error processing item at index ${index}:`, error, item);
                  }
                  return null;
                })}
              </ProgressBar>
            ) : (
              <p>{Device_info_given}</p>
            )}
          </span>
          <br></br>
          <br></br>
          <br></br>
        </div>
        <NameInput onChange={handleNameChange} />
        <div className='p-4'>
          <button
            type="button"
            onClick={handleRevokeClick}
            className="focus:outline-none text-white bg-red-700 hover:bg-red-800 w-20 rounded-full m-5"
          >
            Revoke
          </button>
        </div>
      </div>
    </div>
  );
};

const addContent = async (prevContent, onRevokeClick, token) => {
  if (token) {
    const macData = await getAllMac(token);
    const newContent = Object.keys(macData).map((ip) => {
      return {
        id: ip,
        jsx: () => <AddCard id={ip} ip={ip} macData={macData} onRevokeClick={onRevokeClick} token={token} />,
      };
    });

    const filteredPrevContent = prevContent.filter((prevCard) => !newContent.some((newCard) => newCard.id === prevCard.id));

    return [...filteredPrevContent, ...newContent];
  }
  return prevContent;
};

export { AddCard, addContent };

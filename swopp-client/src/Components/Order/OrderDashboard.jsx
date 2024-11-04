import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../Context/UserContext';
import { Package2, Calendar, MapPin, Clock, DollarSign } from 'lucide-react';
import './OrderDashboard.css';

const OrderDashboard = () => {
  const { token } = useContext(UserContext);  // Get the token when we need it for authorized endpoints
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemsByRequest, setItemsByRequest] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  const [debug, setDebug] = useState({});
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5078/api/request', {
          headers: token ? {
            'Authorization': `Bearer ${token}`
          } : {}
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        console.log('Fetched orders:', data);
        setOrders(data);
        
        // Fetch items for each order
        data.forEach(order => {
          console.log('Fetching items for order:', order.requestId);
          fetchItemsForOrder(order.requestId);
        });
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const fetchItemsForOrder = async (requestId) => {
    try {
      console.log(`Attempting to fetch items for request ${requestId}`);
      
      const url = `http://localhost:5078/api/item/request/${requestId}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      // Log full response details
      console.log(`Response for request ${requestId}:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText || response.statusText}`);
      }
      
      const items = await response.json();
      console.log(`Successfully retrieved items for request ${requestId}:`, items);
      
      setItemsByRequest(prev => ({
        ...prev,
        [requestId]: items
      }));

      setDebug(prev => ({
        ...prev,
        [requestId]: {
          fetchAttempted: true,
          responseStatus: response.status,
          itemsCount: items.length
        }
      }));
    } catch (err) {
      console.error(`Error fetching items for request ${requestId}:`, err);
      setDebug(prev => ({
        ...prev,
        [requestId]: {
          fetchAttempted: true,
          error: err.message,
          stack: err.stack
        }
      }));
    }
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusClassName = (statusCode) => {
    if (statusCode === undefined || statusCode === null) return 'status-default';

    switch (parseInt(statusCode)) {
      case 0: return 'status-pending';
      case 1: return 'status-in-progress';
      case 2: return 'status-completed';
      default: return 'status-default';
    }
  };

  const getStatusText = (statusCode) => {
    if (statusCode === undefined || statusCode === null) return 'Unknown';

    switch (parseInt(statusCode)) {
      case 0: return 'Pending';
      case 1: return 'In Progress';
      case 2: return 'Completed';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return <div className="loading-spinner" />;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">All Orders Dashboard</h1>

      <div className="debug-info" style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0' }}>
        <h3>Debug Information</h3>
        <p>Total Orders: {orders.length}</p>
        <p>Items by Request: {Object.keys(itemsByRequest).length} requests have items</p>
        <pre>{JSON.stringify(orders, null, 2)}</pre>
      </div>

      <div className="orders-grid">
        {orders.map(order => (
          <div key={order.requestId} className="order-card">
            <div className="order-header">
              <h2>Order #{order.requestId}</h2>
              <span className={`status-badge ${getStatusClassName(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>

            <div className="sender-info">
              <span>Sender: {order.senderEmail || 'Unknown Sender'}</span>
            </div>

            <div className="order-details">
              <div className="detail-item">
                <Calendar className="icon" />
                <span>{order.scheduledAt ? formatDate(order.scheduledAt) : 'No date'}</span>
              </div>
              <div className="detail-item">
                <MapPin className="icon" />
                <span>From: {order.pickupLocation || 'No pickup location'}</span>
              </div>
              <div className="detail-item">
                <MapPin className="icon" />
                <span>To: {order.dropoffLocation || 'No dropoff location'}</span>
              </div>
              <div className="detail-item">
                <Package2 className="icon" />
                <span>
                  {itemsByRequest[order.requestId]?.length || 0} items
                  {debug[order.requestId]?.error && ' (Error loading items)'}
                </span>
              </div>
            </div>

            <div className="items-section">
              <button
                className="toggle-button"
                onClick={() => toggleOrderExpansion(order.requestId)}
              >
                {expandedOrders[order.requestId] ? 'Hide Items' : 'View Items'}
              </button>

              {expandedOrders[order.requestId] && (
                <div className="items-grid">
                  {itemsByRequest[order.requestId]?.length > 0 ? (
                    itemsByRequest[order.requestId].map(item => (
                      <div key={item.itemId} className="item-card">
                        <div className="item-header">
                          <Package2 className="icon" />
                          <span className="item-name">{item.itemName}</span>
                        </div>
                        <div className="item-details">
                          <div className="item-detail">
                            <Clock className="icon" />
                            <span>{item.ItemType}</span>
                          </div>
                          <div className="item-detail">
                            <DollarSign className="icon" />
                            <span>${Number(item.price).toFixed(2)}</span>
                          </div>
                        </div>
                        <p className="item-description">{item.description}</p>
                      </div>
                    ))
                  ) : (
                    <div className="no-items-message">
                      {debug[order.requestId]?.error
                        ? `Error loading items: ${debug[order.requestId].error}`
                        : 'No items found for this order'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDashboard;
import React, { useState, useContext } from 'react';
import { UserContext } from '../Context/UserContext';
import { useNavigate } from 'react-router-dom';
import './MyOrder.css';

// Status mapping enum
const RequestStatus = {
  0: 'Pending',
  1: 'Accepted',
  2: 'InProgress',
  3: 'Completed',
  4: 'Cancelled'
};

const MyOrder = () => {
  const { user, token } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get status class name
  const getStatusClassName = (statusCode) => {
    const status = RequestStatus[statusCode] || 'Unknown';
    return `status-${status.toLowerCase()}`;
  };

  // Get status display text
  const getStatusDisplay = (statusCode) => {
    return RequestStatus[statusCode] || 'Unknown';
  };

  React.useEffect(() => {
    fetchOrders();
  }, [user?.email, token]);

  const fetchOrders = async () => {
    if (!user?.email || !token) return;

    try {
      const ordersResponse = await fetch(
        `http://localhost:5078/api/request/user/${encodeURIComponent(user.email)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!ordersResponse.ok) throw new Error('Failed to fetch orders');
      const ordersData = await ordersResponse.json();

      const ordersWithItems = await Promise.all(
        ordersData.map(async (order) => {
          const itemsResponse = await fetch(
            `http://localhost:5078/api/item/request/${order.requestId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          const items = await itemsResponse.json();
          return { ...order, items };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      setError('Failed to load orders');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:5078/api/request/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        setOrders(orders.filter(order => order.requestId !== orderId));
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (error) {
      setError('Failed to delete order');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditOrder = (orderId) => {
    navigate(`/order/edit/${orderId}`);
  };

  if (loading) {
    return <div className="my-orders-loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="my-orders-error">{error}</div>;
  }

  return (
    <div className="my-orders-container">
      <h2>My Orders</h2>
      <div className="orders-grid">
        {orders.map((order) => (
          <div key={order.requestId} className="order-card">
            <div className="order-header">
              <div className="order-title">
                <h3>Order #{order.requestId}</h3>
                <span className={`status-badge ${getStatusClassName(order.status)}`}>
                  {getStatusDisplay(order.status)}
                </span>
              </div>
              <div className="order-actions">
                <button
                  onClick={() => handleEditOrder(order.requestId)}
                  className="edit-btn"
                  disabled={isDeleting || order.status === 3 || order.status === 4} // Disable for Completed or Cancelled
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteOrder(order.requestId)}
                  className="delete-btn"
                  disabled={isDeleting}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="order-details">
              <div className="location-details">
                <p><strong>Pickup:</strong> {order.pickupLocation}</p>
                <p><strong>Dropoff:</strong> {order.dropoffLocation}</p>
                <p><strong>Scheduled:</strong> {new Date(order.scheduledAt).toLocaleString()}</p>
              </div>
              
              {order.items?.length > 0 && (
                <>
                  <button 
                    className="toggle-items-btn"
                    onClick={() => setExpandedOrder(
                      expandedOrder === order.requestId ? null : order.requestId
                    )}
                  >
                    {expandedOrder === order.requestId ? 'Hide Items' : 'Show Items'}
                  </button>

                  {expandedOrder === order.requestId && (
                    <div className="items-grid">
                      {order.items.map((item) => (
                        <div key={item.itemId} className="item-card">
                          {item.image && (
                            <img src={item.image} alt={item.itemName} className="item-image" />
                          )}
                          <div className="item-details">
                            <h4>{item.itemName}</h4>
                            <p><strong>Type:</strong> {item.itemType}</p>
                            <p><strong>Price:</strong> ${item.price.toFixed(2)}</p>
                            {item.description && (
                              <p className="item-description">{item.description}</p>
                            )}
                            <div className="item-dimensions">
                              {item.width && <p>Width: {item.width}cm</p>}
                              {item.height && <p>Height: {item.height}cm</p>}
                              {item.depth && <p>Depth: {item.depth}cm</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrder;
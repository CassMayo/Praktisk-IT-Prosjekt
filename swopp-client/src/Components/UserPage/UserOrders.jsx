import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../Context/UserContext';

const UserOrders = () => {
  const { token } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setOrders(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  return { orders, loading, error };
};

export default UserOrders;
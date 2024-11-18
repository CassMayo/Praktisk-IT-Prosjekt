import React, { useState, useEffect, useContext } from 'react';
import './AdminDashboard.css'; // Import CSS for styling
import { UserContext } from '../Context/UserContext'; // Assuming you have UserContext for auth

const RequestStatus = {
    0: 'Draft',
    1: 'Pending',
    3: 'Completed',
    4: 'Cancelled',
    5: 'Lost'
};

const AdminDashboard = () => {
    const { token } = useContext(UserContext); // Access token for authorization
    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [errorRequests, setErrorRequests] = useState(null);

    // New state variables for users
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [errorUsers, setErrorUsers] = useState(null);

    // Fetch all requests
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch('http://localhost:5078/api/Admin/requests', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch requests');
                }

                const data = await response.json();
                setRequests(data);
                setErrorRequests(null);
            } catch (error) {
                console.error('Error fetching requests:', error);
                setErrorRequests('Failed to load requests.');
            } finally {
                setLoadingRequests(false);
            }
        };

        fetchRequests();
    }, [token]);

    // New useEffect to fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:5078/api/Admin/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }

                const data = await response.json();
                setUsers(data);
                setErrorUsers(null);
            } catch (error) {
                console.error('Error fetching users:', error);
                setErrorUsers('Failed to load users.');
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchUsers();
    }, [token]);

    // Handle Delete Request
    const handleDeleteRequest = async (requestId) => {
        if (!window.confirm('Are you sure you want to delete this request?')) return;

        try {
            const response = await fetch(`http://localhost:5078/api/Admin/request/${requestId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete request');
            }

            // Remove deleted request from state
            setRequests(prevRequests => prevRequests.filter(req => req.requestId !== requestId));
        } catch (error) {
            console.error('Error deleting request:', error);
            alert('Failed to delete request. Please try again.');
        }
    };

    // Handle Delete User
    const handleDeleteUser = async (email) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const response = await fetch(`http://localhost:5078/api/Admin/user/${encodeURIComponent(email)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            // Remove deleted user from state
            setUsers(prevUsers => prevUsers.filter(user => user.email !== email));
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user. Please try again.');
        }
    };

    // Handle Update User (assuming functionality exists)
    const handleUpdateUser = (email) => {
        // Implement logic to update user details, possibly open a modal
    };

    return (
        <div className="admin-dashboard-container">
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <div className="dashboard-sections">
                {/* Users Section */}
                <div className="dashboard-section">
                    <h2>Users</h2>
                    {loadingUsers ? (
                        <p>Loading users...</p>
                    ) : errorUsers ? (
                        <p className="error">{errorUsers}</p>
                    ) : (
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.email}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <button
                                                onClick={() => handleUpdateUser(user.email)}
                                                className="btn-update"
                                            >
                                                Update
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.email)}
                                                className="btn-delete"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Requests Section */}
                <div className="dashboard-section">
                    <h2>Requests</h2>
                    {loadingRequests ? (
                        <p>Loading requests...</p>
                    ) : errorRequests ? (
                        <p className="error">{errorRequests}</p>
                    ) : (
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(request => (
                                    <tr key={request.requestId}>
                                        <td>{request.requestId}</td>
                                        <td>{request.description}</td>
                                        <td>{RequestStatus[request.status]}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteRequest(request.requestId)}
                                                className="btn-delete"
                                            >
                                                Delete
                                            </button>
                                            {/* Add more actions as needed */}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

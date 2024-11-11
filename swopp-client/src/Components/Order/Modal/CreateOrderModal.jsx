import React, { useState } from 'react';
import './CreateOrderModal.css';

const CreateOrderModal = ({ show, onHide, onSubmit, isLoading }) => {
    const [formData, setFormData] = useState({
        pickupLocation: '',
        dropoffLocation: '',
        scheduledAt: '',
        alternateDate: '',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onHide}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Order</h2>
                    <button className="modal-close" onClick={onHide}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <div className="form-field">
                            <label>Pickup Location *</label>
                            <input
                                type="text"
                                value={formData.pickupLocation}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    pickupLocation: e.target.value
                                }))}
                                required
                            />
                        </div>
                        <div className="form-field">
                            <label>Dropoff Location *</label>
                            <input
                                type="text"
                                value={formData.dropoffLocation}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    dropoffLocation: e.target.value
                                }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="form-field">
                            <label>Earliest date* </label>
                            <input
                                type="datetime-local"
                                value={formData.scheduledAt}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    scheduledAt: e.target.value
                                }))}
                                required
                            />
                        </div>
                        <div className="form-field">
                            <label>Latest date</label>
                            <input
                                type="datetime-local"
                                value={formData.alternateDate}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    alternateDate: e.target.value
                                }))}
                            />
                        </div>
                    </div>

                    <div className="form-field">
                        <label>Description (Optional)</label>
                        <textarea
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                description: e.target.value
                            }))}
                        />
                    </div>

                    <div className="modal-actions">
                        <button 
                            type="button" 
                            className="btn-cancel" 
                            onClick={onHide}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating...' : 'Create Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOrderModal;
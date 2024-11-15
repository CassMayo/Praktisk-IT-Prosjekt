import React, { useState } from 'react';


const EditRequestModal = ({ show, onHide, onSubmit, isLoading, initialData }) => {
    const [formData, setFormData] = useState({
        pickupLocation: initialData.pickupLocation || '',
        dropoffLocation: initialData.dropoffLocation || '',
        scheduledAt: initialData.scheduledAt || '',
        alternateDate: initialData.alternateDate || '',
        description: initialData.description || '',
        anytimeScheduled: !initialData.scheduledAt,
        anytimeAlternate: !initialData.alternateDate,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            scheduledAt: formData.anytimeScheduled ? null : formData.scheduledAt,
            alternateDate: formData.anytimeAlternate ? null : formData.alternateDate,
        };
        onSubmit(dataToSubmit); 
    };

    if (!show) return null;

    return (
        <div className="create-order-overlay" onClick={onHide}>
            <div className="create-order-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Order</h2>
                    <button className="modal-close" onClick={onHide}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Pickup Location *</label>
                        <input
                            type="text"
                            value={formData.pickupLocation}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    pickupLocation: e.target.value,
                                }))
                            }
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Dropoff Location *</label>
                        <input
                            type="text"
                            value={formData.dropoffLocation}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    dropoffLocation: e.target.value,
                                }))
                            }
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Earliest date*</label>
                        <input
                            type="date"
                            value={formData.anytimeScheduled ? '' : formData.scheduledAt}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    scheduledAt: e.target.value,
                                }))
                            }
                            disabled={formData.anytimeScheduled}
                            required={!formData.anytimeScheduled}
                        />
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.anytimeScheduled}
                                onChange={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        anytimeScheduled: !prev.anytimeScheduled,
                                        scheduledAt: '',
                                    }))
                                }
                            />
                            Anytime
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Latest date</label>
                        <input
                            type="date"
                            value={formData.anytimeAlternate ? '' : formData.alternateDate}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    alternateDate: e.target.value,
                                }))
                            }
                            disabled={formData.anytimeAlternate}
                            min={formData.scheduledAt || ''}
                        />
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.anytimeAlternate}
                                onChange={() =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        anytimeAlternate: !prev.anytimeAlternate,
                                        alternateDate: '',
                                    }))
                                }
                            />
                            Anytime
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <textarea
                            rows="3"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onHide}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditRequestModal;

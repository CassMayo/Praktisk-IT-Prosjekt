import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const OrderItemsDisplay = ({ items = [], title = "Your Order" }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  if (!items?.length) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <div className="flex items-center space-x-4">
            <span className="text-lg">
              {items.length} {items.length === 1 ? 'package' : 'packages'}
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
        >
          <span>{isExpanded ? 'Hide' : 'Show'} Items</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3 mt-4">
          {items.map((item, index) => (
            <div 
              key={index}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md"
            >
              <div className="w-2 h-2 mt-2 rounded-full bg-gray-800 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="font-medium">{item.name}</div>
                {item.description && (
                  <div className="text-gray-600 text-sm">
                    {item.description}
                  </div>
                )}
                {item.metadata && (
                  <div className="text-sm text-gray-500">
                    {Object.entries(item.metadata).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <span className="font-medium">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderItemsDisplay;
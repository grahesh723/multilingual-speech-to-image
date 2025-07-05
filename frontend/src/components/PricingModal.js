import React from 'react';
import { Modal } from './Modal';

/**
 * PricingModal component for displaying pricing plans
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Function to close modal
 * @param {Array} props.pricingPlans - Array of pricing plans
 * @param {Object} props.currentUser - Current user data
 * @returns {JSX.Element} PricingModal component
 */
export const PricingModal = ({
  isOpen,
  onClose,
  pricingPlans,
  currentUser,
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Pricing Plans"
      maxWidth="max-w-4xl"
      maxHeight="max-h-[90vh]"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {pricingPlans.map((plan) => (
          <div 
            key={plan.name} 
            className={`relative bg-white/80 rounded-xl p-6 border-2 ${
              plan.popular ? 'border-amber-400' : 'border-amber-200'
            } hover:shadow-lg transition-all`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
            )}
            <div className="text-center mb-6">
              <h4 className="text-xl font-bold text-stone-800 mb-2">{plan.name}</h4>
              <div className="text-3xl font-bold text-amber-600">{plan.price}</div>
              <div className="text-stone-600">per {plan.period}</div>
            </div>
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-stone-700">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  {feature}
                </li>
              ))}
            </ul>
            <button 
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                plan.popular 
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white' 
                  : 'bg-stone-200 hover:bg-stone-300 text-stone-800'
              }`}
            >
              {currentUser.plan === plan.name ? 'Current Plan' : 'Choose Plan'}
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
}; 
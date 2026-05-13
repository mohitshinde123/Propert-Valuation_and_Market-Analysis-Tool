import { useState } from 'react';
import { motion } from 'framer-motion';
import { calculateEMI, formatPrice } from '../utils/format';
import { Calculator, IndianRupee, Clock, Percent } from 'lucide-react';

export function EMICalculator({ propertyPrice = 5000000 }) {
  const [loanAmount, setLoanAmount] = useState(propertyPrice * 0.8);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const emi = calculateEMI(loanAmount, interestRate, tenure * 12);
  const totalPayment = emi * tenure * 12;
  const totalInterest = totalPayment - loanAmount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-white p-6 shadow-lg"
    >
      <div className="mb-6 flex items-center gap-2">
        <Calculator className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">EMI Calculator</h3>
      </div>

      <div className="space-y-6">
        {/* Loan Amount */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <IndianRupee className="h-4 w-4" />
              Loan Amount
            </label>
            <span className="text-lg font-bold text-blue-600">{formatPrice(loanAmount)}</span>
          </div>
          <input
            type="range"
            min={propertyPrice * 0.5}
            max={propertyPrice}
            step={100000}
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>{formatPrice(propertyPrice * 0.5)}</span>
            <span>{formatPrice(propertyPrice)}</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Percent className="h-4 w-4" />
              Interest Rate (p.a.)
            </label>
            <span className="text-lg font-bold text-blue-600">{interestRate}%</span>
          </div>
          <input
            type="range"
            min={6}
            max={15}
            step={0.1}
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>6%</span>
            <span>15%</span>
          </div>
        </div>

        {/* Loan Tenure */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4" />
              Loan Tenure
            </label>
            <span className="text-lg font-bold text-blue-600">{tenure} Years</span>
          </div>
          <input
            type="range"
            min={5}
            max={30}
            step={1}
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>5 Years</span>
            <span>30 Years</span>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-3 gap-4 rounded-lg bg-blue-50 p-4">
          <div className="text-center">
            <p className="text-xs text-gray-600">Monthly EMI</p>
            <p className="text-lg font-bold text-blue-600">{formatPrice(emi)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">Total Interest</p>
            <p className="text-lg font-bold text-amber-600">{formatPrice(totalInterest)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">Total Payment</p>
            <p className="text-lg font-bold text-gray-900">{formatPrice(totalPayment)}</p>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Payment Breakdown</p>
          <div className="flex h-4 overflow-hidden rounded-full">
            <div 
              className="bg-blue-600" 
              style={{ width: `${(loanAmount / totalPayment) * 100}%` }}
            />
            <div 
              className="bg-amber-500" 
              style={{ width: `${(totalInterest / totalPayment) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Principal ({Math.round((loanAmount / totalPayment) * 100)}%)
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Interest ({Math.round((totalInterest / totalPayment) * 100)}%)
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

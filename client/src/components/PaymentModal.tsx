import React, { useState } from 'react';
import { X, CheckCircle, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { PaymentMethod, formatNPR } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (method: PaymentMethod, txnId: string) => void;
  amount: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('ESEWA');
  const [mobile, setMobile] = useState('9801234567');
  const [mpin, setMpin] = useState('1234');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [txnRef, setTxnRef] = useState('');

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const randomTxn = `TXN-NP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setTxnRef(randomTxn);
      setIsProcessing(false);
      setStep('SUCCESS');

      setTimeout(() => {
        onSuccess(method, randomTxn);
      }, 1500);
    }, 1800);
  };

  const getTheme = () => {
    switch (method) {
      case 'ESEWA':
        return {
          bg: 'bg-emerald-600',
          text: 'text-emerald-600',
          border: 'border-emerald-600',
          lightBg: 'bg-emerald-50',
          title: 'eSewa Digital Wallet',
        };
      case 'KHALTI':
        return {
          bg: 'bg-purple-700',
          text: 'text-purple-700',
          border: 'border-purple-700',
          lightBg: 'bg-purple-50',
          title: 'Khalti Digital Wallet',
        };
      case 'FONEPAY':
        return {
          bg: 'bg-red-600',
          text: 'text-red-600',
          border: 'border-red-600',
          lightBg: 'bg-red-50',
          title: 'Fonepay Direct QR/Banking',
        };
      default:
        return {
          bg: 'bg-orange-600',
          text: 'text-orange-600',
          border: 'border-orange-600',
          lightBg: 'bg-orange-50',
          title: 'Digital Payment',
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className={`${theme.bg} text-white p-5 relative transition-colors duration-200`}>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-white/80 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Secure Mock Nepal Gateway</span>
          </div>
          <h3 className="text-lg font-bold">{theme.title}</h3>
          <p className="text-white/90 text-sm mt-1">
            Total Payable:{' '}
            <strong className="text-white font-extrabold text-base">
              {formatNPR(amount)}
            </strong>
          </p>
        </div>

        {/* Payment options bar */}
        {step === 'FORM' && (
          <div className="grid grid-cols-3 border-b border-gray-200 bg-gray-50 text-xs font-bold text-center">
            <button
              type="button"
              onClick={() => setMethod('ESEWA')}
              className={`py-3 transition ${
                method === 'ESEWA'
                  ? 'bg-white text-emerald-600 border-b-2 border-emerald-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              eSewa
            </button>
            <button
              type="button"
              onClick={() => setMethod('KHALTI')}
              className={`py-3 transition ${
                method === 'KHALTI'
                  ? 'bg-white text-purple-700 border-b-2 border-purple-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Khalti
            </button>
            <button
              type="button"
              onClick={() => setMethod('FONEPAY')}
              className={`py-3 transition ${
                method === 'FONEPAY'
                  ? 'bg-white text-red-600 border-b-2 border-red-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Fonepay
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {step === 'FORM' ? (
            <form onSubmit={handlePay} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Academic Viva Demo Mode:</strong> Realistic simulated payment. No real money will be charged.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Registered Mobile / eSewa ID (+977)
                </label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="98XXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Wallet MPIN / Security Password
                </label>
                <input
                  type="password"
                  required
                  value={mpin}
                  onChange={(e) => setMpin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono tracking-widest"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 ${theme.bg} hover:opacity-90 disabled:opacity-60`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Authorizing with Nepal Clearing House...</span>
                    </>
                  ) : (
                    <span>Confirm & Pay {formatNPR(amount)}</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Payment Successful!</h4>
              <p className="text-xs text-gray-500">
                Authorized via {method}. Your order is being finalized in Butwal.
              </p>
              <div className="bg-gray-50 rounded-lg p-2.5 font-mono text-xs text-gray-700 border border-gray-200">
                Ref: {txnRef}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, CheckCircle, Shield, AlertCircle, Loader2, Copy, Check, QrCode, Smartphone } from 'lucide-react';
import { PaymentMethod, formatNPR } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (method: PaymentMethod, txnId: string) => void;
  amount: number;
  initialMethod?: PaymentMethod;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  initialMethod = 'ESEWA',
}) => {
  const [method, setMethod] = useState<PaymentMethod>(initialMethod === 'COD' ? 'ESEWA' : initialMethod);
  const [txnId, setTxnId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'QR_SCAN' | 'SUCCESS'>('QR_SCAN');
  const [txnRef, setTxnRef] = useState('');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (initialMethod && initialMethod !== 'COD') {
      setMethod(initialMethod);
    }
    setStep('QR_SCAN');
    setIsProcessing(false);
  }, [initialMethod, isOpen]);

  if (!isOpen) return null;

  const recipientName = 'Anmol Chhetri';
  const recipientPhone = '9748809637';

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(recipientPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutoFillDemoTxn = () => {
    const randomTxn = `${method}-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    setTxnId(randomTxn);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const finalTxn = txnId.trim() || `${method}-TXN-${Date.now().toString(36).toUpperCase()}`;

    setTimeout(() => {
      setTxnRef(finalTxn);
      setIsProcessing(false);
      setStep('SUCCESS');

      setTimeout(() => {
        onSuccess(method, finalTxn);
      }, 1500);
    }, 1400);
  };

  const getTheme = () => {
    switch (method) {
      case 'ESEWA':
        return {
          bg: 'bg-emerald-600',
          text: 'text-emerald-700',
          border: 'border-emerald-600',
          lightBg: 'bg-emerald-50',
          brandName: 'eSewa Mobile Wallet',
          qrImage: '/qr/esewa-qr.png',
          brandColor: '#41a124',
        };
      case 'KHALTI':
        return {
          bg: 'bg-purple-700',
          text: 'text-purple-700',
          border: 'border-purple-700',
          lightBg: 'bg-purple-50',
          brandName: 'Khalti Digital Wallet',
          qrImage: '/qr/khalti-qr.jpg',
          brandColor: '#5c2d91',
        };
      case 'FONEPAY':
      default:
        return {
          bg: 'bg-red-600',
          text: 'text-red-700',
          border: 'border-red-600',
          lightBg: 'bg-red-50',
          brandName: 'Fonepay Interoperable QR',
          qrImage: '/qr/esewa-qr.png', // Fallback to QR
          brandColor: '#dc2626',
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className={`${theme.bg} text-white p-4 sm:p-5 relative transition-colors duration-200 shrink-0`}>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-3.5 right-3.5 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-1.5 rounded-full transition disabled:opacity-50"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2 text-white/80 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Official Merchant QR Payment</span>
          </div>
          <h3 className="text-lg font-extrabold">{theme.brandName}</h3>
          <div className="flex items-center justify-between mt-1 text-white/95">
            <span className="text-xs">Payable Amount:</span>
            <span className="font-mono text-xl font-black bg-white/15 px-2.5 py-0.5 rounded-lg border border-white/20">
              {formatNPR(amount)}
            </span>
          </div>
        </div>

        {/* Tab selection */}
        {step === 'QR_SCAN' && (
          <div className="grid grid-cols-2 border-b border-gray-200 bg-gray-50 text-xs font-bold text-center shrink-0">
            <button
              type="button"
              onClick={() => {
                setMethod('ESEWA');
                setTxnId('');
              }}
              className={`py-3 transition flex items-center justify-center space-x-1.5 ${
                method === 'ESEWA'
                  ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>eSewa QR</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod('KHALTI');
                setTxnId('');
              }}
              className={`py-3 transition flex items-center justify-center space-x-1.5 ${
                method === 'KHALTI'
                  ? 'bg-white text-purple-700 border-b-2 border-purple-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              <span>Khalti QR</span>
            </button>
          </div>
        )}

        {/* Content body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {step === 'QR_SCAN' ? (
            <form onSubmit={handleConfirmPayment} className="space-y-4">
              {/* QR Code Presentation Box */}
              <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl border-2 border-gray-200 p-4 text-center space-y-3 shadow-inner">
                <div className="flex items-center justify-center space-x-1.5 text-gray-500 text-[11px] font-semibold">
                  <QrCode className="w-3.5 h-3.5 text-gray-700" />
                  <span>Scan QR Code with your {method === 'ESEWA' ? 'eSewa' : 'Khalti'} App</span>
                </div>

                {/* The QR Image */}
                <div className="relative inline-block mx-auto p-2 bg-white rounded-xl shadow-md border border-gray-200 group">
                  <img
                    src={theme.qrImage}
                    alt={`${theme.brandName} QR Code`}
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto rounded-lg"
                  />
                  <div className="absolute inset-0 bg-transparent rounded-xl pointer-events-none border-2 border-dashed border-gray-300"></div>
                </div>

                {/* Recipient Details */}
                <div className="bg-white rounded-xl border border-gray-200 p-2.5 text-left space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-[11px]">Account Name:</span>
                    <span className="font-extrabold text-gray-900 text-xs">{recipientName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-[11px]">Mobile / Wallet ID:</span>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-gray-900 text-xs">{recipientPhone}</span>
                      <button
                        type="button"
                        onClick={handleCopyPhone}
                        className="text-gray-500 hover:text-emerald-600 p-1 rounded transition"
                        title="Copy Phone Number"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-gray-100">
                    <span className="text-gray-500 text-[11px]">Amount to Send:</span>
                    <span className="font-mono font-black text-orange-600 text-sm">{formatNPR(amount)}</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-2.5 text-[11px] text-blue-900 space-y-1">
                <p className="font-bold flex items-center space-x-1">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>How to complete payment:</span>
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-blue-800">
                  <li>Open <strong>{method === 'ESEWA' ? 'eSewa' : 'Khalti'}</strong> on your phone.</li>
                  <li>Scan the QR code above and transfer <strong>{formatNPR(amount)}</strong>.</li>
                  <li>Enter the Transaction Code below, or click <strong>Auto-fill Mock Ref</strong> for demo.</li>
                </ol>
              </div>

              {/* Transaction ID Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-gray-700">
                    Transaction Code / Reference ID
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoFillDemoTxn}
                    className="text-[11px] text-orange-600 hover:text-orange-700 font-bold underline"
                  >
                    Auto-fill Demo Ref
                  </button>
                </div>
                <input
                  type="text"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="e.g. 7X9A2BCD (From payment receipt)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-xl text-white font-extrabold text-sm shadow-md transition flex items-center justify-center space-x-2 ${theme.bg} hover:opacity-95 disabled:opacity-60`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Payment with {method}...</span>
                    </>
                  ) : (
                    <span>I Have Paid & Confirm Order ({formatNPR(amount)})</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Payment Verified!</h4>
              <p className="text-xs text-gray-500">
                Payment of <strong>{formatNPR(amount)}</strong> received via {method}. Your order is being placed on the Butwal road graph.
              </p>
              <div className="bg-gray-50 rounded-xl p-3 font-mono text-xs text-gray-700 border border-gray-200">
                Ref ID: <strong>{txnRef}</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

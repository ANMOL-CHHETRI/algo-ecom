import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Phone, CreditCard, ShieldCheck, ArrowRight, Truck, QrCode, Sparkles } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { RoadNode, PaymentMethod, formatNPR } from '../types';
import { DeliveryMap } from '../components/DeliveryMap';
import { PaymentModal } from '../components/PaymentModal';

const CheckoutSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phone: z
    .string()
    .regex(/^(\+977-?)?9[78]\d{8}$/, 'Must be a valid Nepalese phone number (+977-98XXXXXXXX or 97XXXXXXXX)'),
  address: z.string().min(5, 'Delivery address description is required'),
});

type CheckoutFormData = z.infer<typeof CheckoutSchema>;

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { items, subtotal, deliveryCharge, total, clearCart } = useCart();
  const navigate = useNavigate();

  const [selectedNode, setSelectedNode] = useState<RoadNode | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cash on Delivery (COD) requires an extra Rs. 10 handling fee
  const codFee = paymentMethod === 'COD' ? 10 : 0;
  const finalDeliveryCharge = deliveryCharge + codFee;
  const finalTotal = subtotal + finalDeliveryCharge;

  // Auto-select central Butwal node as default if not selected
  useEffect(() => {
    const loadDefaultNode = async () => {
      try {
        const res = await api.get('/delivery/nodes');
        if (res.data.success && res.data.nodes?.length > 0) {
          const defaultNode =
            res.data.nodes.find(
              (n: RoadNode) =>
                n.name.includes('Traffic') || n.name.includes('Kalikanagar') || n.name.includes('Golpark')
            ) || res.data.nodes[0];
          setSelectedNode((prev) => prev || defaultNode);
        }
      } catch (err) {
        console.error('Failed to pre-load default road node', err);
      }
    };
    loadDefaultNode();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(CheckoutSchema),
    defaultValues: {
      fullName: user?.name || '',
      phone: user?.phone || '9801234567',
      address: user?.address || 'Near Ward Office, Butwal Sub-Metropolitan, Rupandehi',
    },
  });

  const onFormSubmit = async (formData: CheckoutFormData) => {
    if (!selectedNode) {
      setErrorMsg('Please select your delivery drop-off landmark on the Butwal Map.');
      return;
    }

    if (paymentMethod !== 'COD') {
      // Trigger mock wallet modal
      setIsPaymentModalOpen(true);
      return;
    }

    await placeOrder(formData, 'COD');
  };

  const placeOrder = async (
    formData: CheckoutFormData,
    method: PaymentMethod
  ) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        deliveryAddress: `${formData.address} [Near ${selectedNode?.name}]`,
        deliveryPhone: formData.phone,
        paymentMethod: method,
        roadNodeId: selectedNode?.id,
        latitude: selectedNode?.latitude,
        longitude: selectedNode?.longitude,
      };

      const res = await api.post('/orders', payload);
      if (res.data.success) {
        navigate(`/orders/${res.data.order.id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
      setIsPaymentModalOpen(false);
    }
  };

  const handleWalletSuccess = async (method: PaymentMethod) => {
    // Collect form data directly and place order
    handleSubmit((data) => placeOrder(data, method))();
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Checkout & Order Placement</h1>
        <p className="text-xs text-gray-500">
          Pinpoint your delivery drop-off node on the Butwal road graph for route optimization.
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Delivery details & Map */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact & Address Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <Phone className="w-4 h-4 text-orange-600" />
              <span>Customer Contact & Delivery Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  {...register('fullName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-orange-500"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-[10px] mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Nepalese Phone Number (+977)
                </label>
                <input
                  type="text"
                  {...register('phone')}
                  placeholder="+977-98XXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-orange-500"
                />
                {errors.phone && (
                  <p className="text-red-500 text-[10px] mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-gray-700 font-semibold mb-1">
                Detailed Street Address / House / Landmark
              </label>
              <textarea
                rows={2}
                {...register('address')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-orange-500"
              />
              {errors.address && (
                <p className="text-red-500 text-[10px] mt-1">{errors.address.message}</p>
              )}
            </div>
          </div>

          {/* Interactive Butwal Map for Node Selection */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Select Delivery Drop-Off Intersection (Butwal Graph)</span>
              </h3>
              {selectedNode && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Selected: {selectedNode.name}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Click any of the 10 real Butwal landmarks below or click on the Leaflet map to map your order:
            </p>

            <DeliveryMap
              selectedNodeId={selectedNode?.id}
              onSelectNode={(node) => setSelectedNode(node)}
              className="h-80"
            />
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-orange-600" />
              <span>Payment Method</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center space-y-1.5 cursor-pointer transition text-center ${
                  paymentMethod === 'COD'
                    ? 'border-orange-600 bg-orange-50/60 text-orange-950 font-bold shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="sr-only"
                />
                <span className="text-2xl">💵</span>
                <span className="font-extrabold text-gray-900">Cash on Delivery</span>
                <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                  +Rs. 10 Handling Charge
                </span>
                <span className="text-[10px] text-gray-400">Pay cash upon doorstep arrival</span>
              </label>

              <label
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center space-y-1.5 cursor-pointer transition text-center ${
                  paymentMethod === 'ESEWA'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="ESEWA"
                  checked={paymentMethod === 'ESEWA'}
                  onChange={() => setPaymentMethod('ESEWA')}
                  className="sr-only"
                />
                <span className="text-2xl">📱</span>
                <span className="font-extrabold text-emerald-800">eSewa Direct QR</span>
                <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                  Save Rs. 10 (Free COD Fee)
                </span>
                <span className="text-[10px] text-gray-500">Scan Anmol Chhetri's QR code</span>
              </label>

              <label
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-center space-y-1.5 cursor-pointer transition text-center ${
                  paymentMethod === 'KHALTI'
                    ? 'border-purple-600 bg-purple-50/60 text-purple-950 font-bold shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="KHALTI"
                  checked={paymentMethod === 'KHALTI'}
                  onChange={() => setPaymentMethod('KHALTI')}
                  className="sr-only"
                />
                <span className="text-2xl">🟣</span>
                <span className="font-extrabold text-purple-800">Khalti Direct QR</span>
                <span className="text-[10px] text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full font-bold">
                  Save Rs. 10 (Free COD Fee)
                </span>
                <span className="text-[10px] text-gray-500">Scan Anmol Chhetri's QR code</span>
              </label>
            </div>

            {/* Instant Live QR Display on Page */}
            {paymentMethod !== 'COD' && (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-emerald-500/30 p-4 sm:p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <QrCode className="w-5 h-5 text-emerald-600" />
                    <span className="font-extrabold text-sm text-gray-900">
                      {paymentMethod === 'ESEWA' ? 'eSewa Direct QR Payment' : 'Khalti Direct QR Payment'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                    Payable: {formatNPR(finalTotal)}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* QR Image with Click to Zoom */}
                  <div
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="cursor-pointer bg-white p-2 rounded-xl border border-gray-200 shadow hover:shadow-md transition text-center shrink-0 group relative"
                    title="Click to view full-screen QR"
                  >
                    <img
                      src={paymentMethod === 'ESEWA' ? '/qr/esewa-qr.png' : '/qr/khalti-qr.jpg'}
                      alt={`${paymentMethod} QR`}
                      className="w-40 h-40 sm:w-44 sm:h-44 object-contain mx-auto rounded-lg"
                    />
                    <span className="text-[10px] text-emerald-700 block mt-1 font-bold group-hover:underline">
                      🔍 Click to Scan & Verify
                    </span>
                  </div>

                  {/* Beneficiary Details */}
                  <div className="space-y-2 text-xs flex-1 w-full">
                    <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-1.5 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-[11px]">Beneficiary Name:</span>
                        <strong className="text-gray-900 font-extrabold">Anmol Chhetri</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-[11px]">Wallet ID / Mobile:</span>
                        <strong className="text-gray-900 font-mono font-bold">9748809637</strong>
                      </div>
                      <div className="flex justify-between items-center border-t border-gray-100 pt-1.5">
                        <span className="text-gray-500 text-[11px]">Total Amount:</span>
                        <strong className="text-orange-600 font-black text-sm">{formatNPR(finalTotal)}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Open Fullscreen QR & Enter Ref Code</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 h-fit">
          <h3 className="font-extrabold text-base text-gray-900 pb-3 border-b border-gray-100">
            Order Review
          </h3>

          <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1 text-xs space-y-2">
            {items.map((item) => (
              <div key={item.id} className="pt-2 flex justify-between items-center">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="font-semibold text-gray-900 truncate">{item.product.name}</p>
                  <p className="text-[11px] text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-gray-900 shrink-0">
                  {formatNPR((item.product.discountPrice ?? item.product.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Items Subtotal</span>
              <span className="font-semibold">{formatNPR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center space-x-1">
                <Truck className="w-3.5 h-3.5 text-orange-600" />
                <span>Base Delivery (Butwal Graph)</span>
              </span>
              <span className="font-semibold">{formatNPR(deliveryCharge)}</span>
            </div>

            {/* COD Handling Fee breakdown */}
            {paymentMethod === 'COD' ? (
              <div className="flex justify-between text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg font-medium">
                <span>Cash on Delivery Handling Charge</span>
                <span className="font-bold">+Rs. 10</span>
              </div>
            ) : (
              <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg font-medium">
                <span>Online QR Payment Discount</span>
                <span className="font-bold">-Rs. 10 (Waived)</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
              <span className="text-sm font-bold text-gray-900">Total Payable</span>
              <span className="text-xl font-black text-orange-600">{formatNPR(finalTotal)}</span>
            </div>
          </div>

          {paymentMethod === 'COD' ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span>Executing Atomic Prisma Transaction...</span>
              ) : (
                <>
                  <span>Place Order ({formatNPR(finalTotal)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center space-x-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR & Pay ({formatNPR(finalTotal)})</span>
            </button>
          )}
        </div>
      </form>

      {/* Mock Payment Gateway Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handleWalletSuccess}
        amount={finalTotal}
        initialMethod={paymentMethod}
      />
    </div>
  );
};

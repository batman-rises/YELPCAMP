import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Tent,
  BookMarked,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  IndianRupee,
  BadgeCheck,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Skeleton } from "../components/ui/Skeleton";

export default function OwnerDashboard() {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Campgrounds");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (!currentUser) return navigate("/login");
    if (currentUser.role !== "owner" && currentUser.role !== "admin") {
      // Not an owner yet — show subscription page
      setLoading(false);
      return;
    }
    fetchDashboard();
  }, [currentUser]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get("/owner/dashboard");
      setData(res.data);
    } catch {
      addToast("Failed to load dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const { data: orderData } = await api.post(
        "/owner/subscription/create-order",
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "LetsCamp",
        description: "Owner Annual Subscription — List your campgrounds",
        order_id: orderData.orderId,
        handler: async (response) => {
          const verify = await api.post("/owner/subscription/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (verify.data.success) {
            setCurrentUser(verify.data.user);
            addToast("Subscription activated! You can now list campgrounds.");
            fetchDashboard();
          }
        },
        prefill: { name: currentUser.username, email: currentUser.email },
        theme: { color: "#2d6a4f" },
        modal: { ondismiss: () => setSubscribing(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      addToast("Subscription failed. Try again.", "error");
    } finally {
      setSubscribing(false);
    }
  };

  // ── Not an owner yet ─────────────────────────────────────────────────────────
  if (!loading && currentUser?.role === "tourist") {
    return (
      <div className="page-container py-16 flex flex-col items-center text-center max-w-lg mx-auto">
        <div className="bg-forest-50 p-6 rounded-full mb-6">
          <Tent size={48} className="text-forest-500" />
        </div>
        <h1 className="font-display text-3xl text-forest-900 mb-3">
          Become a Camp Owner
        </h1>
        <p className="text-gray-500 mb-2 leading-relaxed">
          List your campground on LetsCamp and reach thousands of outdoor
          enthusiasts across India.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Annual subscription — ₹999/year
        </p>

        <div className="w-full bg-white rounded-2xl border border-[#e3dfd7] p-6 mb-6 text-left space-y-3">
          {[
            "List unlimited campgrounds",
            "Get bookings from verified tourists",
            "Manage availability calendar",
            "View booking analytics",
            "Priority listing in search",
          ].map((f) => (
            <div
              key={f}
              className="flex items-center gap-3 text-sm text-gray-700"
            >
              <CheckCircle
                size={16}
                className="text-forest-500 flex-shrink-0"
              />
              {f}
            </div>
          ))}
        </div>

        <button
          onClick={handleSubscribe}
          disabled={subscribing}
          className="w-full bg-forest-700 hover:bg-forest-800 text-white font-medium py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <IndianRupee size={16} />
          {subscribing ? "Processing..." : "Subscribe — ₹999/year"}
        </button>
        <p className="text-xs text-gray-400 mt-3">
          Payment via Razorpay — secure and trusted by millions in India.
        </p>
      </div>
    );
  }

  if (loading)
    return (
      <div className="page-container py-10">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );

  const { stats, campgrounds, bookings, subscription } = data || {};
  const TABS = ["Campgrounds", "Bookings"];

  return (
    <div className="page-container py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-forest-700 p-2.5 rounded-xl">
            <Tent size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-forest-900">
              Owner Dashboard
            </h1>
            <p className="text-gray-500 text-sm">
              Manage your campground listings
            </p>
          </div>
        </div>

        {/* Subscription badge */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${
            subscription?.status === "active"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          <BadgeCheck size={15} />
          {subscription?.status === "active"
            ? `Active until ${new Date(subscription.endDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`
            : "Subscription inactive"}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Tent}
          label="My Campgrounds"
          value={stats?.totalCampgrounds || 0}
          color="green"
        />
        <StatCard
          icon={AlertCircle}
          label="Pending Approval"
          value={stats?.pendingCampgrounds || 0}
          color="amber"
        />
        <StatCard
          icon={BookMarked}
          label="Total Bookings"
          value={stats?.totalBookings || 0}
          color="blue"
        />
        <StatCard
          icon={CheckCircle}
          label="Confirmed"
          value={stats?.confirmedBookings || 0}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f0ece4] p-1 rounded-xl mb-6 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-white text-forest-800 shadow-sm" : "text-gray-500 hover:text-forest-700"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Campgrounds Tab */}
      {tab === "Campgrounds" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-lg text-forest-800">
              Your Listings
            </h2>
            <Link
              to="/campgrounds/new"
              className="flex items-center gap-1.5 bg-forest-700 hover:bg-forest-800 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <Plus size={14} /> New Campground
            </Link>
          </div>

          {campgrounds?.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e3dfd7] p-12 text-center">
              <Tent size={36} className="text-forest-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No campgrounds listed yet.</p>
              <Link
                to="/campgrounds/new"
                className="bg-forest-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-forest-800 transition-colors"
              >
                List your first campground
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#e3dfd7] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#f0ece4]">
                  <tr>
                    <th className="text-left px-4 py-3 text-forest-700 font-medium">
                      Campground
                    </th>
                    <th className="text-left px-4 py-3 text-forest-700 font-medium hidden md:table-cell">
                      Price
                    </th>
                    <th className="text-left px-4 py-3 text-forest-700 font-medium">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-forest-700 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {campgrounds.map((c) => (
                    <tr
                      key={c._id}
                      className="border-t border-[#f0ece4] hover:bg-[#faf8f5]"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/campgrounds/${c._id}`}
                          className="font-medium text-forest-800 hover:text-forest-600"
                        >
                          {c.title}
                        </Link>
                        <p className="text-xs text-gray-400">{c.location}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                        ₹{c.price}/night
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Link
                            to={`/campgrounds/${c._id}/edit`}
                            className="text-forest-600 hover:bg-forest-50 p-1.5 rounded-lg"
                          >
                            <Edit size={14} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {tab === "Bookings" && (
        <div className="bg-white rounded-2xl border border-[#e3dfd7] overflow-hidden">
          {bookings?.length === 0 ? (
            <div className="p-12 text-center">
              <BookMarked size={36} className="text-forest-300 mx-auto mb-3" />
              <p className="text-gray-500">
                No bookings yet for your campgrounds.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#f0ece4]">
                <tr>
                  <th className="text-left px-4 py-3 text-forest-700 font-medium">
                    Campground
                  </th>
                  <th className="text-left px-4 py-3 text-forest-700 font-medium hidden md:table-cell">
                    Tourist
                  </th>
                  <th className="text-left px-4 py-3 text-forest-700 font-medium hidden md:table-cell">
                    Dates
                  </th>
                  <th className="text-left px-4 py-3 text-forest-700 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b._id}
                    className="border-t border-[#f0ece4] hover:bg-[#faf8f5]"
                  >
                    <td className="px-4 py-3 font-medium text-forest-800">
                      {b.campground?.title || "—"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                      {b.tourist?.username || "—"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-400 text-xs">
                      {new Date(b.checkIn).toLocaleDateString("en-IN")} →{" "}
                      {new Date(b.checkOut).toLocaleDateString("en-IN")}
                      <span className="ml-1 text-gray-500">({b.nights}n)</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-[#e3dfd7] p-5">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}
      >
        <Icon size={20} />
      </div>
      <p className="text-2xl font-display text-forest-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    approved: "bg-green-50 text-green-700 border-green-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    confirmed: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200",
  };
  const icons = {
    approved: <CheckCircle size={11} />,
    pending: <Clock size={11} />,
    rejected: <XCircle size={11} />,
    confirmed: <CheckCircle size={11} />,
    cancelled: <XCircle size={11} />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${styles[status] || styles.pending}`}
    >
      {icons[status]} {status}
    </span>
  );
}

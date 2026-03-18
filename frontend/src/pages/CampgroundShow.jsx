import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  User,
  Heart,
  HeartOff,
  Edit,
  Trash2,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ShowMap from "../components/maps/ShowMap";
import ImageCarousel from "../components/ui/ImageCarousel";
import ReviewSection from "../components/reviews/ReviewSection";
import { StarDisplay } from "../components/ui/StarRating";
import { Skeleton } from "../components/ui/Skeleton";

export default function CampgroundShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();
  const { addToast } = useToast();
  const [campground, setCampground] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Booking state
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [booking, setBooking] = useState(false); // loading state

  useEffect(() => {
    api
      .get(`/campgrounds/${id}`)
      .then((res) => setCampground(res.data.campground))
      .catch(() => {
        addToast("Campground not found", "error");
        navigate("/campgrounds");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const isFavorite = currentUser?.favorites?.some(
    (fav) => (fav._id || fav) === id || (fav._id || fav)?.toString() === id,
  );

  const isAuthor = currentUser && campground?.author?._id === currentUser._id;

  const toggleFavorite = async () => {
    if (!currentUser) return navigate("/login");
    setFavLoading(true);
    try {
      const res = await api.post(`/campgrounds/${id}/favorite`);
      setCurrentUser(res.data.user);
      addToast(isFavorite ? "Removed from favorites" : "Saved to favorites!");
    } catch {
      addToast("Something went wrong", "error");
    } finally {
      setFavLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/campgrounds/${id}`);
      addToast("Campground deleted");
      navigate("/campgrounds");
    } catch {
      addToast("Failed to delete campground", "error");
      setDeleting(false);
    }
  };

  // ── Razorpay booking ──────────────────────────────────────────────────────
  const handleBooking = async () => {
    if (!currentUser) return navigate("/login");
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      addToast("Please select valid check-in and check-out dates", "error");
      return;
    }
    setBooking(true);
    try {
      // 1. Create order on backend
      const { data } = await api.post("/payment/create-order", {
        campgroundId: id,
        checkIn,
        checkOut,
      });

      // 2. Open Razorpay checkout popup
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "LetsCamp",
        description: `Booking: ${data.campgroundTitle} · ${data.nights} night${data.nights > 1 ? "s" : ""}`,
        order_id: data.orderId,
        handler: async (response) => {
          // 3. Verify payment on backend
          const verify = await api.post("/payment/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId: data.bookingId,
          });
          if (verify.data.success) {
            addToast("Booking confirmed! See you at the campsite!", "success");
          }
        },
        prefill: {
          name: currentUser.username,
          email: currentUser.email,
        },
        theme: { color: "#2d6a4f" },
        modal: {
          ondismiss: () => {
            addToast("Payment cancelled", "error");
            setBooking(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      addToast(err?.response?.data?.message || "Booking failed", "error");
    } finally {
      setBooking(false);
    }
  };

  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000),
        )
      : 1;

  const avgRating = campground?.reviews?.length
    ? campground.reviews.reduce((sum, r) => sum + r.rating, 0) /
      campground.reviews.length
    : null;

  if (loading) return <ShowSkeleton />;

  return (
    <div className="page-container py-10">
      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left — images + info */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link
              to="/campgrounds"
              className="hover:text-forest-600 transition-colors"
            >
              Campgrounds
            </Link>
            <span>/</span>
            <span className="text-gray-600">{campground.title}</span>
          </div>

          {/* Carousel */}
          <ImageCarousel images={campground.images} />

          {/* Title + meta */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-display text-3xl text-forest-900">
                {campground.title}
              </h1>

              {/* Favorite */}
              <button
                onClick={toggleFavorite}
                disabled={favLoading}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                  isFavorite
                    ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                    : "border-[#e3dfd7] text-gray-500 hover:border-red-300 hover:text-red-400"
                }`}
              >
                {isFavorite ? (
                  <>
                    <HeartOff size={14} />
                    Saved
                  </>
                ) : (
                  <>
                    <Heart size={14} />
                    Save
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                {campground.location}
              </span>
              <span className="flex items-center gap-1.5">
                <User size={14} />
                {campground.author?.username || "LetsCamp Admin"}
              </span>
              {avgRating && (
                <span className="flex items-center gap-1.5">
                  <StarDisplay rating={avgRating} size={13} />
                  {avgRating.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-[#e3dfd7] p-6">
            <h2 className="font-display text-lg text-forest-800 mb-3">
              About this campground
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {campground.description}
            </p>
          </div>

          {/* Author actions */}
          {isAuthor && (
            <div className="flex items-center gap-3">
              <Link
                to={`/campgrounds/${id}/edit`}
                className="btn-outline flex items-center gap-1.5"
              >
                <Edit size={14} />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-danger flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}

          {/* Reviews */}
          <ReviewSection
            campgroundId={id}
            reviews={campground.reviews || []}
            onReviewChange={() => {
              api
                .get(`/campgrounds/${id}`)
                .then((res) => setCampground(res.data.campground));
            }}
          />
        </div>

        {/* Right — price + map */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Price + Booking card */}
          <div className="bg-white rounded-2xl border border-[#e3dfd7] p-6 shadow-card sticky top-24">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-display text-3xl text-forest-800">
                ₹{campground.price?.toLocaleString("en-IN")}
              </span>
              <span className="text-gray-400 text-sm">/ night</span>
            </div>
            {avgRating && (
              <div className="flex items-center gap-2 mb-4">
                <StarDisplay rating={avgRating} size={14} />
                <span className="text-sm text-gray-500">
                  {avgRating.toFixed(1)} · {campground.reviews?.length} review
                  {campground.reviews?.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {/* Date pickers */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Check-in
                </label>
                <input
                  type="date"
                  value={checkIn}
                  min={today}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full border border-[#e3dfd7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Check-out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full border border-[#e3dfd7] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-forest-500"
                />
              </div>
            </div>

            <div className="h-px bg-[#e3dfd7] my-3" />

            {/* Price breakdown */}
            <div className="text-sm text-gray-500 space-y-2 mb-4">
              <div className="flex justify-between">
                <span>
                  ₹{campground.price?.toLocaleString("en-IN")} × {nights} night
                  {nights !== 1 ? "s" : ""}
                </span>
                <span className="text-forest-800 font-medium">
                  ₹{(campground.price * nights)?.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Platform booking fee</span>
                <span>₹1</span>
              </div>
            </div>

            {/* Book Now button */}
            <button
              onClick={handleBooking}
              disabled={booking}
              className="w-full bg-forest-700 hover:bg-forest-800 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <CalendarDays size={16} />
              {booking ? "Processing..." : "Book Now · Pay ₹1"}
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">
              Pay ₹1 platform fee to confirm your booking
            </p>
          </div>

          {/* Map */}
          <div>
            <h3 className="font-display text-lg text-forest-800 mb-3">
              Location
            </h3>
            <ShowMap campground={campground} />
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
              <MapPin size={13} />
              {campground.location}
            </p>
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lifted">
            <AlertTriangle size={32} className="text-red-500 mb-3" />
            <h3 className="font-display text-xl text-gray-900 mb-2">
              Delete Campground?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              This will permanently remove the campground and all its reviews.
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger flex-1"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShowSkeleton() {
  return (
    <div className="page-container py-10 grid lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 flex flex-col gap-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="w-full h-72 rounded-2xl" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
      <div className="lg:col-span-2 flex flex-col gap-5">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

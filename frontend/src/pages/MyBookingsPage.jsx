import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  Tent,
} from "lucide-react";
import api from "../lib/api";
import { useToast } from "../context/ToastContext";
import { Skeleton } from "../components/ui/Skeleton";

const STATUS_STYLES = {
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    classes: "bg-green-50 text-green-700 border-green-200",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    classes: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    classes: "bg-red-50 text-red-700 border-red-200",
  },
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    api
      .get("/api/bookings/my")
      .then((res) => setBookings(res.data.bookings))
      .catch(() => addToast("Could not load bookings", "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <BookingsSkeleton />;

  return (
    <div className="page-container py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-forest-900">My Bookings</h1>
        <p className="text-gray-500 mt-1">
          All your campground reservations in one place
        </p>
      </div>

      {/* Empty state */}
      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="bg-forest-50 p-6 rounded-full mb-4">
            <Tent size={40} className="text-forest-400" />
          </div>
          <h2 className="font-display text-xl text-forest-800 mb-2">
            No bookings yet
          </h2>
          <p className="text-gray-500 mb-6">
            You haven't booked any campgrounds yet. Start exploring!
          </p>
          <Link
            to="/campgrounds"
            className="bg-forest-700 hover:bg-forest-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Browse Campgrounds
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking }) {
  const status = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
  const StatusIcon = status.icon;
  const camp = booking.campground;

  const checkIn = new Date(booking.checkIn).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const checkOut = new Date(booking.checkOut).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const bookedOn = new Date(booking.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl border border-[#e3dfd7] overflow-hidden shadow-card hover:shadow-lifted transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {/* Campground image */}
        <div className="sm:w-48 h-40 sm:h-auto flex-shrink-0">
          {camp?.images?.[0] ? (
            <img
              src={camp.images[0].url}
              alt={camp.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-forest-100 flex items-center justify-center">
              <Tent size={32} className="text-forest-400" />
            </div>
          )}
        </div>

        {/* Booking info */}
        <div className="flex-1 p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Link
                to={`/campgrounds/${camp?._id}`}
                className="font-display text-xl text-forest-900 hover:text-forest-600 transition-colors"
              >
                {camp?.title || "Campground"}
              </Link>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin size={12} />
                {camp?.location || "—"}
              </p>
            </div>

            {/* Status badge */}
            <span
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${status.classes}`}
            >
              <StatusIcon size={12} />
              {status.label}
            </span>
          </div>

          {/* Dates */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-forest-50 px-3 py-2 rounded-lg">
              <CalendarDays size={14} className="text-forest-600" />
              <div>
                <p className="text-xs text-gray-400">Check-in</p>
                <p className="font-medium text-forest-800">{checkIn}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-forest-50 px-3 py-2 rounded-lg">
              <CalendarDays size={14} className="text-forest-600" />
              <div>
                <p className="text-xs text-gray-400">Check-out</p>
                <p className="font-medium text-forest-800">{checkOut}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-forest-50 px-3 py-2 rounded-lg">
              <div>
                <p className="text-xs text-gray-400">Duration</p>
                <p className="font-medium text-forest-800">
                  {booking.nights} night{booking.nights !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[#e3dfd7] text-xs text-gray-400">
            <span>Booked on {bookedOn}</span>
            <span className="font-medium text-forest-700">
              Platform fee: ₹1 paid ✓
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingsSkeleton() {
  return (
    <div className="page-container py-10">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-8" />
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-40 rounded-2xl mb-4" />
      ))}
    </div>
  );
}

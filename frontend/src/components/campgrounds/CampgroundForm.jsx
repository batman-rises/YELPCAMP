import { useState } from "react";
import { Sparkles, Loader2, Upload, X, ImagePlus } from "lucide-react";
import api from "../../lib/api";
import { cn } from "../../lib/utils";

export default function CampgroundForm({
  initialData = {},
  onSubmit,
  submitting,
}) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    location: initialData.location || "",
    price: initialData.price || "",
    description: initialData.description || "",
  });

  const [newImages, setNewImages] = useState([]); // File objects
  const [previews, setPreviews] = useState([]); // data URLs
  const [deleteImages, setDeleteImages] = useState([]); // existing filenames to delete
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  const existingImages = initialData.images || [];

  // ── Field change ──────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Image upload preview ──────────────────────────────────────────────────
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setPreviews((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (idx) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleDeleteExisting = (filename) => {
    setDeleteImages((prev) =>
      prev.includes(filename)
        ? prev.filter((f) => f !== filename)
        : [...prev, filename],
    );
  };

  // ── AI Description generator ──────────────────────────────────────────────
  const generateDescription = async () => {
    if (!form.title && !form.location) {
      setGenError("Enter a title or location first.");
      return;
    }
    setGenError("");
    setGenerating(true);
    try {
      const res = await api.post("/ai/generate-description", {
        title: form.title,
        location: form.location,
      });
      setForm((prev) => ({ ...prev, description: res.data.description }));
    } catch (err) {
      setGenError(
        err.response?.data?.message || "Generation failed. Try again.",
      );
    } finally {
      setGenerating(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("campground[title]", form.title);
    formData.append("campground[location]", form.location);
    formData.append("campground[price]", form.price);
    formData.append("campground[description]", form.description);
    newImages.forEach((file) => formData.append("image", file));
    deleteImages.forEach((fn) => formData.append("deleteImages[]", fn));
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Campground Title <span className="text-red-400">*</span>
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          placeholder="e.g. Misty Pines Base Camp"
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800
                     placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40
                     focus:border-forest-500 transition"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Location <span className="text-red-400">*</span>
        </label>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          required
          placeholder="e.g. Manali, Himachal Pradesh"
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800
                     placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40
                     focus:border-forest-500 transition"
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Price per night (₹) <span className="text-red-400">*</span>
        </label>
        <input
          name="price"
          type="number"
          min="0"
          value={form.price}
          onChange={handleChange}
          required
          placeholder="e.g. 1500"
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800
                     placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40
                     focus:border-forest-500 transition"
        />
      </div>

      {/* Description + AI button */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-stone-700">
            Description <span className="text-red-400">*</span>
          </label>

          {/* ✨ AI Generate button */}
          <button
            type="button"
            onClick={generateDescription}
            disabled={generating}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all",
              generating
                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : "bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 shadow-sm hover:shadow-md",
            )}
          >
            {generating ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles size={12} /> Generate with AI
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {genError && <p className="text-xs text-red-500 mb-1.5">{genError}</p>}

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={5}
          placeholder="Describe the campground — surroundings, facilities, what makes it special..."
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-800
                     placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40
                     focus:border-forest-500 transition resize-none"
        />

        {/* AI hint */}
        <p className="text-xs text-stone-400 mt-1">
          💡 Fill in the title and location above, then click "Generate with AI"
          to auto-fill this field.
        </p>
      </div>

      {/* Existing images (edit mode) */}
      {existingImages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Current Images
          </label>
          <div className="grid grid-cols-3 gap-3">
            {existingImages.map((img) => (
              <div
                key={img.filename}
                className="relative group rounded-xl overflow-hidden aspect-video"
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => toggleDeleteExisting(img.filename)}
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-all",
                    deleteImages.includes(img.filename)
                      ? "bg-red-500/70"
                      : "bg-black/0 group-hover:bg-black/40",
                  )}
                >
                  <X
                    size={20}
                    className={cn(
                      "text-white transition-opacity",
                      deleteImages.includes(img.filename)
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100",
                    )}
                  />
                </button>
                {deleteImages.includes(img.filename) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs text-center py-0.5">
                    Will be deleted
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New image upload */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          {existingImages.length > 0 ? "Add More Images" : "Images"}
        </label>

        {/* Upload zone */}
        <label
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed
                          border-stone-300 rounded-xl cursor-pointer hover:border-forest-400
                          hover:bg-forest-50/50 transition-all group"
        >
          <ImagePlus
            size={24}
            className="text-stone-400 group-hover:text-forest-500 mb-2 transition-colors"
          />
          <span className="text-sm text-stone-500 group-hover:text-forest-600 transition-colors">
            Click to upload images
          </span>
          <span className="text-xs text-stone-400 mt-0.5">
            PNG, JPG, WEBP up to 10MB
          </span>
          <input
            type="file"
            name="image"
            multiple
            accept="image/*"
            onChange={handleImages}
            className="hidden"
          />
        </label>

        {/* New image previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-3">
            {previews.map((src, idx) => (
              <div
                key={idx}
                className="relative group rounded-xl overflow-hidden aspect-video"
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewImage(idx)}
                  className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-0.5
                             opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-xl font-medium text-white transition-all
                   bg-forest-600 hover:bg-forest-700 disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-sm hover:shadow-md"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Saving...
          </span>
        ) : initialData._id ? (
          "Save Changes"
        ) : (
          "Create Campground"
        )}
      </button>
    </form>
  );
}

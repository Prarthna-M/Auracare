function FilterBar({ filters, onFilterChange }) {

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      skinType: "All",
      productType: "All",
      minRating: 0,
      sortBy: "newest"
    });
  };

  return (

    <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">

      {/* Header */}
      <h3 className="text-xl font-bold mb-5 flex items-center gap-2">
        <span>🔍</span> Filter Reviews
      </h3>

      {/* Filters Grid */}
      <div className="grid md:grid-cols-4 gap-5">

        {/* Skin Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Skin Type
          </label>
          <select 
            className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
            value={filters.skinType}
            onChange={(e) => handleChange("skinType", e.target.value)}
          >
            <option value="All">All Skin Types</option>
            <option value="Oily">Oily</option>
            <option value="Dry">Dry</option>
            <option value="Combination">Combination</option>
            <option value="Sensitive">Sensitive</option>
            <option value="Normal">Normal</option>
            <option value="Acne-Prone">Acne-Prone</option>
            <option value="Mature">Mature</option>
          </select>
        </div>

        {/* Product Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Product Type
          </label>
          <select 
            className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
            value={filters.productType}
            onChange={(e) => handleChange("productType", e.target.value)}
          >
            <option value="All">All Products</option>
            <option value="Cleanser">Cleanser</option>
            <option value="Serum">Serum</option>
            <option value="Moisturizer">Moisturizer</option>
            <option value="Sunscreen">Sunscreen</option>
            <option value="Toner">Toner</option>
            <option value="Exfoliant">Exfoliant</option>
            <option value="Mask">Mask</option>
            <option value="Eye Cream">Eye Cream</option>
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Minimum Rating
          </label>
          <select 
            className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
            value={filters.minRating}
            onChange={(e) => handleChange("minRating", Number(e.target.value))}
          >
            <option value="0">All Ratings</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Sort By
          </label>
          <select 
            className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
            value={filters.sortBy}
            onChange={(e) => handleChange("sortBy", e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highestRated">Highest Rated</option>
            <option value="mostUsed">Most Days Used</option>
          </select>
        </div>

      </div>

      {/* Active Filters */}
      {(filters.skinType !== "All" || filters.productType !== "All" || filters.minRating > 0) && (

        <div className="mt-5 pt-4 border-t flex flex-wrap items-center gap-2">

          <span className="text-sm text-gray-600">Active filters:</span>

          {filters.skinType !== "All" && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {filters.skinType}
            </span>
          )}

          {filters.productType !== "All" && (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              {filters.productType}
            </span>
          )}

          {filters.minRating > 0 && (
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              {filters.minRating}+ Stars
            </span>
          )}

          <button
            onClick={clearFilters}
            className="text-red-600 text-sm hover:underline ml-2"
          >
            Clear all
          </button>

        </div>

      )}

    </div>
  );
}

export default FilterBar;
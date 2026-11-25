import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api/hotelApi";

export const PAGE_SIZE = 6;

// ---------- async actions (they call the backend) ----------
// rejectWithValue keeps the server's { message, errors } object intact,
// so the form can show field-level errors.

export const fetchHotels = createAsyncThunk(
  "hotels/fetchList",
  async ({ search, minPrice, maxPrice, page }, { rejectWithValue }) => {
    try {
      return await api.getHotels({
        search,
        minPrice,
        maxPrice,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const fetchHotelById = createAsyncThunk(
  "hotels/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      return await api.getHotel(id);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createHotel = createAsyncThunk(
  "hotels/create",
  async ({ values, file }, { rejectWithValue }) => {
    try {
      return await api.createHotel(values, file);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const editHotel = createAsyncThunk(
  "hotels/edit",
  async ({ id, values, file }, { rejectWithValue }) => {
    try {
      return await api.updateHotel(id, values, file);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const removeHotel = createAsyncThunk(
  "hotels/remove",
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteHotel(id);
      return id;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// ---------- slice ----------
const initialState = {
  // the hotels on the current page
  items: [],
  total: 0, // total hotels matching the filters (all pages)
  listStatus: "idle", // idle | loading | succeeded | failed
  listError: null,
  listRequestId: null, // used to ignore out-of-date responses

  // the single hotel shown on the details / edit pages
  current: null,
  currentStatus: "idle",
  currentError: null,

  filters: { search: "", minPrice: "", maxPrice: "" },
  page: 1,
};

const hotelSlice = createSlice({
  name: "hotels",
  initialState,
  reducers: {
    setSearch(state, action) {
      state.filters.search = action.payload;
      state.page = 1;
    },
    setPriceRange(state, action) {
      state.filters.minPrice = action.payload.minPrice;
      state.filters.maxPrice = action.payload.maxPrice;
      state.page = 1;
    },
    resetFilters(state) {
      state.filters = initialState.filters;
      state.page = 1;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- list ---
      .addCase(fetchHotels.pending, (state, action) => {
        state.listStatus = "loading";
        state.listError = null;
        state.listRequestId = action.meta.requestId;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        // If the user typed again while this was loading, ignore the old response.
        if (state.listRequestId !== action.meta.requestId) return;
        state.listStatus = "succeeded";
        state.items = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        if (state.listRequestId !== action.meta.requestId) return;
        state.listStatus = "failed";
        state.listError = action.payload?.message || "Could not load hotels";
      })

      // --- single hotel ---
      .addCase(fetchHotelById.pending, (state, action) => {
        state.currentStatus = "loading";
        state.currentError = null;
        // don't show the previous hotel while a different one loads
        if (state.current && String(state.current.id) !== String(action.meta.arg)) {
          state.current = null;
        }
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.currentStatus = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.current = null;
        state.currentError = action.payload?.message || "Could not load this hotel";
      })

      // --- edit: keep the details page in sync ---
      .addCase(editHotel.fulfilled, (state, action) => {
        state.current = action.payload;
        state.currentStatus = "succeeded";
      })

      // --- delete ---
      .addCase(removeHotel.fulfilled, (state, action) => {
        state.items = state.items.filter((h) => h.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
        if (state.current && state.current.id === action.payload) state.current = null;
      });
  },
});

export const { setSearch, setPriceRange, resetFilters, setPage } = hotelSlice.actions;

// ---------- selectors ----------
export const selectHotels = (state) => state.hotels.items;
export const selectTotal = (state) => state.hotels.total;
export const selectListStatus = (state) => state.hotels.listStatus;
export const selectListError = (state) => state.hotels.listError;
export const selectFilters = (state) => state.hotels.filters;
export const selectPage = (state) => state.hotels.page;
export const selectCurrent = (state) => state.hotels.current;
export const selectCurrentStatus = (state) => state.hotels.currentStatus;
export const selectCurrentError = (state) => state.hotels.currentError;

export default hotelSlice.reducer;

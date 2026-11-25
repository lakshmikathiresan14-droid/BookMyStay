import { query } from "../db/pool.js";
import { deleteImageFile } from "../middleware/upload.js";
import { validateHotelBody } from "../middleware/validate.js";

// Express 4 doesn't catch errors from async handlers, so we wrap them.
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Columns we send back. NUMERIC comes out of pg as a string, so cast to float.
const COLUMNS = `
  id, title, description,
  latitude::float8 AS latitude,
  longitude::float8 AS longitude,
  price::float8 AS price,
  image_path AS image,
  created_at, updated_at`;

// Make % and _ in the search text behave like normal characters inside ILIKE.
const escapeLike = (text) => text.replace(/[\\%_]/g, "\\$&");

const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// ---------------------------------------------------------------
// GET /api/hotels?search=&minPrice=&maxPrice=&limit=&offset=
// ---------------------------------------------------------------
export const listHotels = asyncHandler(async (req, res) => {
  const { search, minPrice, maxPrice } = req.query;

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 50);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

  const conditions = [];
  const params = [];

  if (search && search.trim()) {
    params.push(`%${escapeLike(search.trim())}%`);
    conditions.push(`title ILIKE $${params.length}`);
  }

  if (minPrice !== undefined && minPrice !== "") {
    if (Number.isNaN(Number(minPrice))) {
      return res.status(400).json({ message: "minPrice must be a number" });
    }
    params.push(Number(minPrice));
    conditions.push(`price >= $${params.length}`);
  }

  if (maxPrice !== undefined && maxPrice !== "") {
    if (Number.isNaN(Number(maxPrice))) {
      return res.status(400).json({ message: "maxPrice must be a number" });
    }
    params.push(Number(maxPrice));
    conditions.push(`price <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // total count (with the same filters) so the client can build the pagination
  const countResult = await query(`SELECT COUNT(*)::int AS total FROM hotels ${where}`, params);

  const dataParams = [...params, limit, offset];
  const dataResult = await query(
    `SELECT ${COLUMNS}
       FROM hotels
       ${where}
      ORDER BY created_at DESC, id DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
    dataParams
  );

  res.json({
    data: dataResult.rows,
    total: countResult.rows[0].total,
    limit,
    offset,
  });
});

// ---------------------------------------------------------------
// GET /api/hotels/:id
// ---------------------------------------------------------------
export const getHotel = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid hotel id" });

  const { rows } = await query(`SELECT ${COLUMNS} FROM hotels WHERE id = $1`, [id]);
  if (rows.length === 0) return res.status(404).json({ message: "Hotel not found" });

  res.json(rows[0]);
});

// ---------------------------------------------------------------
// POST /api/hotels   (multipart/form-data, image field is "image")
// ---------------------------------------------------------------
export const createHotel = asyncHandler(async (req, res) => {
  const errors = validateHotelBody(req.body, { imageProvided: Boolean(req.file) });

  if (Object.keys(errors).length > 0) {
    // the file was already saved by multer, so clean it up
    if (req.file) await deleteImageFile(`/uploads/${req.file.filename}`);
    return res.status(400).json({ message: "Please fix the highlighted fields.", errors });
  }

  const { title, description, latitude, longitude, price } = req.body;
  const imagePath = `/uploads/${req.file.filename}`;

  const { rows } = await query(
    `INSERT INTO hotels (title, description, latitude, longitude, price, image_path)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUMNS}`,
    [title.trim(), description.trim(), Number(latitude), Number(longitude), Number(price), imagePath]
  );

  res.status(201).json(rows[0]);
});

// ---------------------------------------------------------------
// PUT /api/hotels/:id   (image is optional; send it to replace the old one)
// ---------------------------------------------------------------
export const updateHotel = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const newImagePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!id) {
    await deleteImageFile(newImagePath);
    return res.status(400).json({ message: "Invalid hotel id" });
  }

  const existing = await query("SELECT image_path FROM hotels WHERE id = $1", [id]);
  if (existing.rows.length === 0) {
    await deleteImageFile(newImagePath);
    return res.status(404).json({ message: "Hotel not found" });
  }
  const oldImagePath = existing.rows[0].image_path;

  // The hotel already has an image, so a new one is optional here.
  const errors = validateHotelBody(req.body, { imageProvided: true });
  if (Object.keys(errors).length > 0) {
    await deleteImageFile(newImagePath);
    return res.status(400).json({ message: "Please fix the highlighted fields.", errors });
  }

  const { title, description, latitude, longitude, price } = req.body;

  const { rows } = await query(
    `UPDATE hotels
        SET title = $1, description = $2, latitude = $3, longitude = $4,
            price = $5, image_path = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING ${COLUMNS}`,
    [
      title.trim(),
      description.trim(),
      Number(latitude),
      Number(longitude),
      Number(price),
      newImagePath || oldImagePath,
      id,
    ]
  );

  // Only remove the old file once the database has the new one.
  if (newImagePath) await deleteImageFile(oldImagePath);

  res.json(rows[0]);
});

// ---------------------------------------------------------------
// DELETE /api/hotels/:id
// ---------------------------------------------------------------
export const deleteHotel = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid hotel id" });

  const { rows } = await query("DELETE FROM hotels WHERE id = $1 RETURNING image_path", [id]);
  if (rows.length === 0) return res.status(404).json({ message: "Hotel not found" });

  await deleteImageFile(rows[0].image_path);

  res.json({ message: "Hotel deleted successfully", id });
});

import { useDispatch } from "react-redux";
import { useRef, useState } from "react";
import Modal from "./Modal";
import { removeHotel } from "../redux/hotelSlice";

// Handles the whole delete journey: confirm -> delete (API call) -> success popup.
// `hotel` is the hotel the user wants to delete (or null when nothing is selected).
// `onFinished` is called after the user closes the success popup.
export default function DeleteFlow({ hotel, onCancel, onFinished }) {
  const dispatch = useDispatch();
  const [deletedTitle, setDeletedTitle] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // The hotel disappears from the store the moment it's deleted. Remember it so the
  // confirm dialog doesn't blink away before the success popup appears.
  const lastHotel = useRef(hotel);
  if (hotel) lastHotel.current = hotel;
  const target = hotel || (busy ? lastHotel.current : null);

  if (!target && !deletedTitle) return null;

  if (deletedTitle) {
    return (
      <Modal
        title="Hotel deleted"
        tone="success"
        onClose={onFinished}
        actions={
          <button className="btn btn-primary" onClick={onFinished} autoFocus>
            OK
          </button>
        }
      >
        <div className="success-icon" aria-hidden="true">✓</div>
        <p>
          <strong>{deletedTitle}</strong> was deleted successfully.
        </p>
      </Modal>
    );
  }

  const confirmDelete = async () => {
    setBusy(true);
    setError("");
    try {
      await dispatch(removeHotel(target.id)).unwrap();
      setDeletedTitle(target.title);
    } catch (err) {
      setError(err?.message || "Could not delete the hotel. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = () => {
    setError("");
    onCancel();
  };

  return (
    <Modal
      title="Delete this hotel?"
      onClose={busy ? undefined : handleCancel}
      actions={
        <>
          <button className="btn btn-ghost" onClick={handleCancel} disabled={busy}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={confirmDelete} disabled={busy}>
            {busy ? "Deleting…" : "Yes, delete"}
          </button>
        </>
      }
    >
      <p>
        You are about to delete <strong>{target.title}</strong>. This can't be undone.
      </p>
      {error && (
        <p className="error-text" role="alert" style={{ marginTop: 10 }}>
          {error}
        </p>
      )}
    </Modal>
  );
}

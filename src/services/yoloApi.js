/**
 * ForestGuard YOLO Detection API
 * Service untuk komunikasi dengan backend YOLO
 */

const API_BASE_URL = import.meta.env.VITE_YOLO_API_URL || 'http://localhost:8000';

/**
 * Deteksi api/asap dari file gambar
 * @param {File|HTMLVideoElement} file - File gambar atau element video
 * @returns {Promise<Object>} Hasil deteksi { class, confidence, danger, ... }
 */
export async function detectFromFile(file) {
  const formData = new FormData();

  // Jika inputnya HTMLVideoElement, capture frame dulu
  if (file instanceof HTMLVideoElement) {
    const canvas = document.createElement('canvas');
    canvas.width = file.videoWidth || 640;
    canvas.height = file.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(file, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.85));
    formData.append('file', blob, 'frame.jpg');
  } else {
    formData.append('file', file);
  }

  const response = await fetch(`${API_BASE_URL}/detect`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Gagal mendeteksi gambar');
  }

  return response.json();
}

/**
 * Deteksi api/asap dari URL gambar
 * @param {string} imageUrl - URL gambar
 * @returns {Promise<Object>} Hasil deteksi
 */
export async function detectFromUrl(imageUrl) {
  const response = await fetch(`${API_BASE_URL}/detect-url?image_url=${encodeURIComponent(imageUrl)}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Gagal mendeteksi dari URL');
  }

  return response.json();
}

/**
 * Cek status API YOLO
 * @returns {Promise<Object>} Status { status, model_loaded, message }
 */
export async function checkApiStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.json();
  } catch (error) {
    return {
      status: 'error',
      model_loaded: false,
      message: 'API tidak dapat dijangkau: ' + error.message
    };
  }
}

/**
 * Get daftar class yang bisa dideteksi
 * @returns {Promise<Object>} { classes, description }
 */
export async function getClasses() {
  const response = await fetch(`${API_BASE_URL}/classes`);
  if (!response.ok) {
    throw new Error('Gagal mengambil daftar class');
  }
  return response.json();
}

/**
 * Helper: Cek apakah hasil deteksi berbahaya
 * @param {Object} result - Hasil dari detectFromFile/detectFromUrl
 * @returns {boolean} true jika danger
 */
export function isDanger(result) {
  return result?.danger === true || result?.danger_level !== 'none';
}

/**
 * Helper: Get label Indonesia dari hasil deteksi
 * @param {Object} result - Hasil dari detectFromFile/detectFromUrl
 * @returns {string} Label Indonesia
 */
export function getLabel(result) {
  return result?.label || result?.class || 'Unknown';
}

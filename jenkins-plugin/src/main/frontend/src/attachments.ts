export interface LocalAttachment {
  mediaType: string;
  fileName: string;
  dataBase64: string;
  previewUrl: string;
  size: number;
}

const ALLOWED = ['image/png', 'image/jpeg', 'image/webp'];

export async function prepareAttachment(file: File, maxMb: number): Promise<LocalAttachment> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error('Only PNG, JPEG, and WebP images are supported');
  }
  if (file.size > maxMb * 1024 * 1024) {
    throw new Error(`Image exceeds the ${maxMb} MB limit`);
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const maxSide = 1568;
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not prepare the image');
    }
    context.drawImage(image, 0, 0, width, height);
    let dataUrl = canvas.toDataURL(file.type, 0.9);
    if (dataUrl.length > maxMb * 1024 * 1024 * 1.4) {
      dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    }
    const comma = dataUrl.indexOf(',');
    if (comma < 0) {
      throw new Error('Could not encode the image');
    }
    const mediaType = dataUrl.slice(5, dataUrl.indexOf(';'));
    return {
      mediaType,
      fileName: file.name || 'image',
      dataBase64: dataUrl.slice(comma + 1),
      previewUrl: dataUrl,
      size: Math.round((dataUrl.length - comma - 1) * 0.75),
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not read the image'));
    image.src = url;
  });
}
